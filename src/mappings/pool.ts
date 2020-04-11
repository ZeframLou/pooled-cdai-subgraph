import {
  Mint as MintEvent,
  Burn as BurnEvent,
  WithdrawInterest as WithdrawInterestEvent,
  SetBeneficiary as SetBeneficiaryEvent,
  OwnershipTransferred as OwnershipTransferredEvent
} from "../../generated/Factory/Pool"
import { Pool, DataPoint } from "../../generated/schema"
import * as Utils from '../utils'

export function handleMint(event: MintEvent): void {
  let pool = Pool.load(event.address.toHex())

  // update totalSupply
  pool.totalSupply = pool.totalSupply.plus(Utils.normalize(event.params.amount))

  // update totalSupplyHistory
  let dp = new DataPoint('totalSupplyHistory' + Utils.DELIMITER + event.block.timestamp.toString())
  dp.pool = pool.id
  dp.timestamp = event.block.timestamp
  dp.value = pool.totalSupply
  dp.save()
  let totalSupplyHistory = pool.totalSupplyHistory
  totalSupplyHistory.push(dp.id)
  pool.totalSupplyHistory = totalSupplyHistory

  pool.save()
}

export function handleBurn(event: BurnEvent): void {
  let pool = Pool.load(event.address.toHex())

  // update totalSupply
  pool.totalSupply = pool.totalSupply.minus(Utils.normalize(event.params.amount))

  // update totalSupplyHistory
  let dp = new DataPoint('totalSupplyHistory' + Utils.DELIMITER + event.block.timestamp.toString())
  dp.pool = pool.id
  dp.timestamp = event.block.timestamp
  dp.value = pool.totalSupply
  dp.save()
  let totalSupplyHistory = pool.totalSupplyHistory
  totalSupplyHistory.push(dp.id)
  pool.totalSupplyHistory = totalSupplyHistory

  pool.save()
}

export function handleWithdrawInterest(event: WithdrawInterestEvent): void {
  let pool = Pool.load(event.address.toHex())
  let interestAmount = Utils.normalize(event.params.amount)

  // update totalInterestWithdrawn
  pool.totalInterestWithdrawn = pool.totalInterestWithdrawn.plus(interestAmount)

  // update totalInterestWithdrawnHistory
  let dp = new DataPoint('totalInterestWithdrawnHistory' + Utils.DELIMITER + event.block.timestamp.toString())
  dp.pool = pool.id
  dp.timestamp = event.block.timestamp
  dp.value = pool.totalInterestWithdrawn
  dp.save()
  let totalInterestWithdrawnHistory = pool.totalInterestWithdrawnHistory
  totalInterestWithdrawnHistory.push(dp.id)
  pool.totalInterestWithdrawnHistory = totalInterestWithdrawnHistory

  pool.save()
}

export function handleSetBeneficiary(event: SetBeneficiaryEvent): void {
  let pool = Pool.load(event.address.toHex())

  // update beneficiary
  pool.beneficiary = event.params.newBeneficiary.toHex();

  pool.save()
}

export function handleOwnershipTransferred(event: OwnershipTransferredEvent): void {
  let pool = Pool.load(event.address.toHex())

  if (pool) {
    // update owner
    pool.owner = event.params.newOwner.toHex()

    pool.save()
  }
}