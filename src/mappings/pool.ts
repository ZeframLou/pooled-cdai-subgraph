import {
  Mint as MintEvent,
  Burn as BurnEvent,
  WithdrawInterest as WithdrawInterestEvent,
  SetBeneficiaries as SetBeneficiariesEvent,
  OwnershipTransferred as OwnershipTransferredEvent
} from "../../generated/Factory/Pool"
import { Pool, DataPoint, Beneficiary, BeneficiaryHistory } from "../../generated/schema"
import { Pool as PoolContract } from "../../generated/Factory/Pool"
import * as Utils from '../utils'
import { BigInt } from "@graphprotocol/graph-ts"

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

  // update beneficiary interest history
  let beneficiaries = pool.beneficiaries
  for (let i = 0; i < pool.beneficiaries.length; i++) {
    let beneficiaryID = beneficiaries[i]
    let beneficiary = Beneficiary.load(beneficiaryID)
    let beneficiaryHistoryID = pool.address + Utils.DELIMITER + beneficiary.dest
    let beneficiaryHistory = BeneficiaryHistory.load(beneficiaryHistoryID)
    if (!beneficiaryHistory) {
      beneficiaryHistory = new BeneficiaryHistory(beneficiaryHistoryID)
      beneficiaryHistory.address = beneficiary.dest
      beneficiaryHistory.pool = pool.id
      beneficiaryHistory.totalInterestReceived = Utils.ZERO_DEC
      beneficiaryHistory.totalInterestReceivedHistory = new Array<string>()
    }

    // update interest amount
    let beneficiaryInterest = interestAmount.times(beneficiary.weight.toBigDecimal()).div(pool.totalBeneficiaryWeight.toBigDecimal())
    beneficiaryHistory.totalInterestReceived = beneficiaryHistory.totalInterestReceived.plus(beneficiaryInterest)

    // update interest history
    let dp = new DataPoint('totalInterestReceivedHistory' + Utils.DELIMITER + beneficiaryHistoryID + event.block.timestamp.toString())
    dp.pool = pool.id
    dp.timestamp = event.block.timestamp
    dp.value = beneficiaryHistory.totalInterestReceived
    dp.save()
    let interestHistory = beneficiaryHistory.totalInterestReceivedHistory
    interestHistory.push(dp.id)
    beneficiaryHistory.totalInterestReceivedHistory = interestHistory

    beneficiaryHistory.save()
  }

  pool.save()
}

export function handleSetBeneficiaries(event: SetBeneficiariesEvent): void {
  let pool = Pool.load(event.address.toHex())
  let contract = PoolContract.bind(event.address)

  // update beneficiary
  pool.totalBeneficiaryWeight = contract.totalBeneficiaryWeight()

  let i = 0;
  let beneficiaries = new Array<string>()
  let tryBeneficiary = contract.try_beneficiaries(Utils.ZERO_INT)
  while (!tryBeneficiary.reverted) {
    // add beneficiary to list
    let beneficiaryAddr = tryBeneficiary.value.value0.toHex()
    let beneficiary = new Beneficiary(event.transaction.hash.toHex() + Utils.DELIMITER + pool.id + Utils.DELIMITER + beneficiaryAddr + Utils.DELIMITER + i.toString())
    beneficiary.pool = pool.id
    beneficiary.dest = beneficiaryAddr
    beneficiary.weight = tryBeneficiary.value.value1
    beneficiary.save()
    beneficiaries.push(beneficiary.id)

    // move to next beneficiary
    i += 1
    tryBeneficiary = contract.try_beneficiaries(BigInt.fromI32(i))
  }
  pool.beneficiaries = beneficiaries;
  pool.numBeneficiaries = BigInt.fromI32(beneficiaries.length)

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