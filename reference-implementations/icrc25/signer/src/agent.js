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

export async function pollForCert(agent, canisterId, requestId) {
  if (agent.rootKey == null) throw new Error('Agent root key not initialized before polling')
  const path = [new TextEncoder().encode('request_status'), requestId]

  for (;;) {
    const request = await agent.createReadStateRequest({paths: [path]})
    const state = await agent.readState(canisterId, {paths: [path]}, undefined, request)
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

    switch (status) {
      // terminal state, end polling
      case RequestStatusResponseStatus.Replied:
      case RequestStatusResponseStatus.Rejected:
      case RequestStatusResponseStatus.Done:
        return state.certificate

      // continue polling
      case RequestStatusResponseStatus.Received:
      case RequestStatusResponseStatus.Unknown:
      case RequestStatusResponseStatus.Processing:
        continue;
      default:
        throw new Error('unexpected response status')
    }
  }
}
