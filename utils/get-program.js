import * as anchor from '@project-serum/anchor'
import { Connection } from '@solana/web3.js'
import {WalletNotConnectedError} from '@solana/wallet-adapter-base'
import { STABLE_POOL_IDL, STABLE_POOL_PROGRAM_ID } from './const'

export function getProgramInstance(connection, wallet){
    if (!wallet?.publicKey) {
        throw new WalletNotConnectedError()
    }
    const provider = new anchor.Provider(
        connection,
        wallet,
        anchor.Provider.defaultOptions(),
    )
    console.log('B')

    const idl = STABLE_POOL_IDL
console.log('c')
    const programId = STABLE_POOL_PROGRAM_ID
console.log('d')
    const program = new anchor.Program(idl, programId, provider)
console.log('r')
    return program
}
