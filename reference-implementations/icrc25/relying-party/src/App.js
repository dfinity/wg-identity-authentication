/* global BigInt */
import { BeaconEvent } from '@airgap/beacon-sdk'
import { Certificate, requestIdOf } from '@dfinity/agent'
import { Principal } from '@dfinity/principal'
import { randomBytes } from 'crypto-browserify'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {callQuery, createAgent, rootKey} from './agent'
import { BalanceArgs, BalanceResult, idlDecode, idlEncode, TransferArgs, TransferResult } from './idl'
import './App.css'
import { createDAppClient, publicKeyFromAccount } from './beacon';
import initSigVerifier, {verifyIcSignature} from '@dfinity/standalone-sig-verifier-web';

const MAIN_CHAIN_ID = 'icp:737ba355e855bd4b61279056603e0550'
const ICRC21_CANISTER_ID = 'xhy27-fqaaa-aaaao-a2hlq-cai'

const ICRC21_TRANSFER_FEE = BigInt(1)

function App() {
  const client = useMemo(() => createDAppClient(), [])
  const verifier = initSigVerifier();

  const [activeAccount, setActiveAccount] = useState(undefined)
  const [balance, setBalance] = useState(undefined)
  const [recipient, setRecipient] = useState(undefined)
  const [amount, setAmount] = useState(undefined)
  const [sendResult, setSendResult] = useState(undefined)

  useEffect(() => {
    const setInitialActiveAccount = async () => {
      const activeAccount = await client.getActiveAccount()
      setActiveAccount(activeAccount)
    }

    setInitialActiveAccount()
    
    client.subscribeToEvent(BeaconEvent.ACTIVE_ACCOUNT_SET, async () => {
      const activeAccount = await client.getActiveAccount()
      setActiveAccount(activeAccount)
    })
  }, [client])

  const fetchBalance = useCallback(async () => {
    try {
      const queryResponse = await callQuery(ICRC21_CANISTER_ID, 'balance_of', idlEncode([BalanceArgs], [{
        account: Principal.selfAuthenticating(publicKeyFromAccount(activeAccount))
      }]))

      const balance = idlDecode([BalanceResult], queryResponse)[0]
      if (balance.Err) {
        throw balance.Err
      }

      setBalance({
        owner: balance.Ok.owner.toString(),
        deposit: balance.Ok.deposit.toString()
      })
    } catch (error) {
      console.error('fetchBalance error', error)
    }
  }, [activeAccount])

  useEffect(() => {
    if (activeAccount) {
      fetchBalance()
    }
  }, [activeAccount, fetchBalance])

  const verifyPermissionResponse = async (response, challenge) => {
    const derPublicKey = Uint8Array.from(Buffer.from(response.result.identities[0].publicKey, 'base64'))
    const signatureRaw = Uint8Array.from(Buffer.from(response.result.signature, 'base64'))
    const dataRaw = Uint8Array.from(Buffer.concat([
      Buffer.from(new TextEncoder().encode('\x0Aic-wallet-challenge')),
      challenge
    ]))
    const root_key = new Uint8Array((await createAgent()).rootKey)
    try {
      // make sure signature verifier is initialized
      await verifier;
      verifyIcSignature(dataRaw, signatureRaw, derPublicKey, root_key);
      console.log('challenge verified')
    } catch (error) {
      console.error('verifyIcSignature error', error)
    }
  }

  const verifyContentMap = (sender, canisterId, method, arg, contentMap) => {
    if (sender.compareTo(contentMap.sender) !== 'eq') {
      throw new Error(`Invalid content map, senders don't match (${sender.toText()} != ${contentMap.sender.toText()})`)
    }

    if (canisterId !== contentMap.canister_id.toText()) {
      throw new Error(`Invalid content map, canister IDs don't match (${canisterId} != ${contentMap.canister_id.toText()})`)
    }

    if (method !== contentMap.method_name) {
      throw new Error(`Invalid content map, method names don't match (${method} != ${contentMap.method_name})`)
    }

    if (Buffer.from(arg).toString('hex') !== contentMap.arg.toString('hex')) {
      throw new Error(`Invalid content map, args don't match (${arg.toString('hex')} != ${contentMap.arg.toString('hex')})`)
    }

    console.log('content map verified')
  }

  const requestPermission = async () => {
    setSendResult(undefined)

    try {
      const challenge = randomBytes(32)
      const response = await client.ic.requestPermissions({
        version: '1',
        appMetadata: {
          name: client.name,
          url: client.appUrl,
        },
        networks: [{ chainId: MAIN_CHAIN_ID }],
        scopes: ['canister_call'],
        challenge: Buffer.from(challenge).toString('base64')
      })

      await verifyPermissionResponse(response, challenge)

      console.log('requestPermissions success', response)
    } catch (error) {
      setActiveAccount(undefined)
      console.error('requestPermissions error', error)
    }
  }

  const onRecipientInput = (event) => {
    setRecipient(event.target.value)
  }

  const onAmountInput = (event) => {
    setAmount(event.target.value)
  }

  const contentMapFromResponse = (response) => {
    return {
      request_type: response.result.contentMap.request_type,
      sender: Principal.fromUint8Array(Buffer.from(response.result.contentMap.sender, 'base64')),
      nonce: response.result.contentMap.nonce ? Buffer.from(response.result.contentMap.nonce, 'base64') : undefined,
      ingress_expiry: BigInt(response.result.contentMap.ingress_expiry),
      canister_id: Principal.fromUint8Array(Buffer.from(response.result.contentMap.canister_id, 'base64')),
      method_name: response.result.contentMap.method_name,
      arg: Buffer.from(response.result.contentMap.arg, 'base64')
    }
  }

  const certificateFromResponse = async (response) => {
    return Certificate.create({
      certificate: Buffer.from(response.result.certificate, 'base64'),
      rootKey: await rootKey(),
      canisterId: Principal.fromUint8Array(Buffer.from(response.result.contentMap.canister_id, 'base64'))
    })
  }

  const send = async () => {
    setSendResult(undefined)

    const canisterId = ICRC21_CANISTER_ID
    const method = 'transfer'

    try {
      const sender = Principal.selfAuthenticating(publicKeyFromAccount(activeAccount))
      const arg = idlEncode([TransferArgs], [{
        from_subaccount: [],
        to: {
          owner: Principal.from(recipient),
          subaccount: []
        },
        amount: BigInt(amount)
      }])

      const response = await client.ic.requestCanisterCall({
        version: '1',
        network: { chainId: MAIN_CHAIN_ID },
        canisterId,
        sender: sender.toText(),
        method,
        arg: Buffer.from(arg).toString('base64')
      })
      console.log('requestCanisterCall `transfer` response', response)

      const contentMap = contentMapFromResponse(response)
      verifyContentMap(sender, canisterId, method, arg, contentMap)

      const requestId = requestIdOf(contentMap)
      const certificate = await certificateFromResponse(response)
      const path = [new TextEncoder().encode('request_status'), requestId]
      const result = idlDecode([TransferResult], certificate.lookup([...path, 'reply']))[0]

      console.log('requestCanisterCall `transfer` success')

      setSendResult(JSON.parse(JSON.stringify(result, (_, value) => typeof value === 'bigint' ? value.toString() : value, 2)))
      fetchBalance()
    } catch (error) {
      console.error(`requestCanisterCall ${method} error`, error)
    }
  }

  const reset = () => {
    client.destroy().then(() => {
      window.location.reload()
    })
  }

  return (
    <div className="App">
      ICRC-25 Example DApp
      <br /><br />
      <button onClick={requestPermission}>Request Permission</button>
      <br /><br />
      <div>
        Active account:
        <br />
        <span>{activeAccount ? Principal.selfAuthenticating(publicKeyFromAccount(activeAccount)).toText() : ''}</span>
        <span>{activeAccount?.chainData.identities[0].ledger?.subaccounts[0]}</span>
        {/* <span>{activeAccount?.network.type}</span> */}
        <span>{activeAccount?.origin.type}</span>
      </div>
      <br />
      {activeAccount && (
        <>
          <div>Balance: {balance ? (
            BigInt(balance.owner) > 0 ? `${balance.deposit} DEV (To Deposit: ${BigInt(balance.owner) - ICRC21_TRANSFER_FEE} DEV)` : `${balance.deposit} DEV`
          ) : '---'}</div>
          <br />
          <button onClick={fetchBalance}>Fetch Balance</button>
          <br />
          ---
          <br /><br />
          Transfer
          <br /><br />
          <input type="text" placeholder='to (principal)' onChange={onRecipientInput}></input>
          <input type="text" placeholder='amount' onChange={onAmountInput}></input>
          <button onClick={send}>Send</button>
          {sendResult && <div className='multiline'>{JSON.stringify(sendResult, null, 2)}</div>}
          <br /><br />
        </>
      )}
      ---
      <br /><br />
      <button onClick={reset}>Reset and Refresh</button>
    </div>
  );
}

export default App;
