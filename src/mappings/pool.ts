import {
  Mint as MintEvent,
  Burn as BurnEvent,
  WithdrawInterest as WithdrawInterestEvent,
  SetBeneficiary as SetBeneficiaryEvent,
  OwnershipTransferred as OwnershipTransferredEvent
} from "../../generated/Factory/Pool"
import { Pool, DataPoint } from "../../generated/schema"
import { Pool as PoolContract } from "../../generated/Factory/Pool"
import { CERC20 as CERC20Contract } from "../../generated/Factory/templates/Pool/CERC20"
import * as Utils from '../utils'

export function handleMint(event: MintEvent): void {
  let pool = Pool.load(event.address.toHex())

  // update totalSupply
  pool.totalSupply = pool.totalSupply.plus(Utils.normalize(event.params.amount))

  // update totalSupplyHistory
  let dp = new DataPoint('totalSupplyHistory-' + event.block.timestamp.toString())
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
  let dp = new DataPoint('totalSupplyHistory-' + event.block.timestamp.toString())
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

  // update totalInterestWithdrawn
  if (event.params.inDAI) {
    pool.totalInterestWithdrawn = pool.totalInterestWithdrawn.plus(Utils.normalize(event.params.amount))
  } else {
    let poolContract = PoolContract.bind(event.address)
    let cDAI = CERC20Contract.bind(poolContract.CDAI_ADDRESS())
    let exchangeRate = Utils.normalize(cDAI.exchangeRateStored())
    let amountInDAI = exchangeRate.times(event.params.amount.toBigDecimal()).div(Utils.PRECISION)
    pool.totalInterestWithdrawn = pool.totalInterestWithdrawn.plus(amountInDAI)
  }

  // update totalInterestWithdrawnHistory
  let dp = new DataPoint('totalInterestWithdrawnHistory-' + event.block.timestamp.toString())
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
  pool.beneficiary = event.params.newBeneficiary.toHex()

  pool.save()
}

export function handleOwnershipTransferred(event: OwnershipTransferredEvent): void {
  let pool = Pool.load(event.address.toHex())

  // update beneficiary
  pool.owner = event.params.newOwner.toHex()

  pool.save()
}