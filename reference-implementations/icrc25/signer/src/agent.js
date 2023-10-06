import { 
  Certificate,
  polling,
  RequestStatusResponseStatus
} from '@dfinity/agent'
import { Secp256k1KeyIdentity } from '@dfinity/identity-secp256k1'
import { Principal } from '@dfinity/principal'
import { createAgent as _createAgent } from '@dfinity/utils'

const LOCAL_HOST = 'http://127.0.0.1:4943'
const PUBLIC_HOST = 'https://icp-api.io'

export async function createAgent(mnemonic) {
  return _createAgent({
    identity: Secp256k1KeyIdentity.fromSeedPhrase(mnemonic),
    host: LOCAL_HOST /* TODO: use different hosts depending on build environment */,
    fetchRootKey: true
  })
}

export async function call(agent, canisterId, methodName, arg) {
  const callResponse = await agent.call(canisterId, {methodName, arg})
  return await polling.pollForResponse(agent, Principal.from(canisterId), callResponse.requestId, polling.defaultStrategy())
}

export async function readState(agent, canisterId, requestId, strategy = polling.defaultStrategy()) {
  return pollForResponse(agent, Principal.from(canisterId), requestId, strategy)
}

async function pollForResponse(agent, canisterId, requestId, strategy, request) {
  const path = [new TextEncoder().encode('request_status'), requestId]
  const currentRequest = request ?? (await agent.createReadStateRequest?.({ paths: [path] }))
  const state = await agent.readState(canisterId, { paths: [path] }, undefined, currentRequest)
  if (agent.rootKey == null) throw new Error('Agent root key not initialized before polling')
  const cert = await Certificate.create({
    certificate: state.certificate,
    rootKey: agent.rootKey,
    canisterId: canisterId
  })
  const maybeBuf = cert.lookup([...path, new TextEncoder().encode('status')])
  let status
  if (typeof maybeBuf === 'undefined') {
    // Missing requestId means we need to wait
    status = RequestStatusResponseStatus.Unknown
  } else {
    status = new TextDecoder().decode(maybeBuf)
  }

  // eslint-disable-next-line default-case
  switch (status) {
    case RequestStatusResponseStatus.Replied: {
      return { 
        response: cert.lookup([...path, 'reply']),
        certificate: state.certificate
      }
    }

    case RequestStatusResponseStatus.Received:
    case RequestStatusResponseStatus.Unknown:
    case RequestStatusResponseStatus.Processing:
      // Execute the polling strategy, then retry.
      await strategy(canisterId, requestId, status)
      return pollForResponse(agent, canisterId, requestId, strategy, currentRequest)

    case RequestStatusResponseStatus.Rejected: {
      const rejectCode = new Uint8Array(cert.lookup([...path, 'reject_code']))[0]
      const rejectMessage = new TextDecoder().decode(cert.lookup([...path, 'reject_message']))
      throw new Error(
        `Call was rejected:\n` +
          `  Request ID: ${Buffer.from(requestId).toString('hex')}\n` +
          `  Reject code: ${rejectCode}\n` +
          `  Reject text: ${rejectMessage}\n`
      )
    }

    case RequestStatusResponseStatus.Done:
      // This is _technically_ not an error, but we still didn't see the `Replied` status so
      // we don't know the result and cannot decode it.
      throw new Error(`Call was marked as done but we never saw the reply:\n` + `  Request ID: ${Buffer.from(requestId).toString('hex')}\n`)
  }
  throw new Error('unreachable')
}