import {
  CreatePoolWithMetadata as CreatePoolWithMetadataEvent,
  CreatePool as CreatePoolEvent
} from "../../generated/Factory/Factory"
import { Pool, Registry, Beneficiary } from "../../generated/schema"
import { Pool as PoolContract } from "../../generated/Factory/Pool"
import { Pool as PoolTemplate } from "../../generated/templates"
import * as Utils from '../utils'
import { BigInt } from "@graphprotocol/graph-ts";

export function handleCreatePoolWithMetadata(
  event: CreatePoolWithMetadataEvent
): void {
  // create Pool entity
  let entity = new Pool(event.params.pool.toHex())
  let contract = PoolContract.bind(event.params.pool)
  entity.address = event.params.pool.toHex()
  entity.totalSupply = Utils.ZERO_DEC
  entity.totalSupplyHistory = new Array<string>()
  entity.totalInterestWithdrawn = Utils.ZERO_DEC
  entity.totalInterestWithdrawnHistory = new Array<string>()
  entity.creator = event.params.sender.toHex()
  entity.creationTimestamp = event.block.timestamp
  entity.owner = contract.owner().toHex()
  entity.name = contract.name()
  entity.symbol = contract.symbol()
  entity.totalBeneficiaryWeight = contract.totalBeneficiaryWeight()

  let i = 0;
  let beneficiaries = new Array<string>()
  let tryBeneficiary = contract.try_beneficiaries(Utils.ZERO_INT)
  while (!tryBeneficiary.reverted) {
    // add beneficiary to list
    let beneficiaryAddr = tryBeneficiary.value.value0.toHex()
    let beneficiary = new Beneficiary(event.transaction.hash.toHex() + Utils.DELIMITER + entity.id + Utils.DELIMITER + beneficiaryAddr + Utils.DELIMITER + i.toString())
    beneficiary.pool = entity.id
    beneficiary.dest = beneficiaryAddr
    beneficiary.weight = tryBeneficiary.value.value1
    beneficiary.save()
    beneficiaries.push(beneficiary.id)

    // move to next beneficiary
    i += 1
    tryBeneficiary = contract.try_beneficiaries(BigInt.fromI32(i))
  }
  entity.beneficiaries = beneficiaries;
  entity.numBeneficiaries = BigInt.fromI32(beneficiaries.length)

  entity.save()

  // create datasource template for Pool
  PoolTemplate.create(event.params.pool)

  // increase numPools
  let reg = Registry.load('0')
  if (reg == null) {
    reg = new Registry('0')
    reg.numPools = Utils.ZERO_INT
  }
  reg.numPools = reg.numPools.plus(BigInt.fromI32(1))
  reg.save()
}

export function handleCreatePool(event: CreatePoolEvent): void {
  // create Pool entity
  let entity = new Pool(event.params.pool.toHex())
  let contract = PoolContract.bind(event.params.pool)
  entity.address = event.params.pool.toHex()
  entity.totalSupply = Utils.ZERO_DEC
  entity.totalSupplyHistory = new Array<string>()
  entity.totalInterestWithdrawn = Utils.ZERO_DEC
  entity.totalInterestWithdrawnHistory = new Array<string>()
  entity.creator = event.params.sender.toHex()
  entity.creationTimestamp = event.block.timestamp
  entity.owner = contract.owner().toHex()
  entity.name = contract.name()
  entity.symbol = contract.symbol()
  entity.totalBeneficiaryWeight = contract.totalBeneficiaryWeight()

  let i = 0;
  let beneficiaries = new Array<string>()
  let tryBeneficiary = contract.try_beneficiaries(Utils.ZERO_INT)
  while (!tryBeneficiary.reverted) {
    // add beneficiary to list
    let beneficiaryAddr = tryBeneficiary.value.value0.toHex()
    let beneficiary = new Beneficiary(event.transaction.hash.toHex() + Utils.DELIMITER + entity.id + Utils.DELIMITER + beneficiaryAddr + Utils.DELIMITER + i.toString())
    beneficiary.pool = entity.id
    beneficiary.dest = beneficiaryAddr
    beneficiary.weight = tryBeneficiary.value.value1
    beneficiary.save()
    beneficiaries.push(beneficiary.id)

    // move to next beneficiary
    i += 1
    tryBeneficiary = contract.try_beneficiaries(BigInt.fromI32(i))
  }
  entity.beneficiaries = beneficiaries;
  entity.numBeneficiaries = BigInt.fromI32(beneficiaries.length)

  entity.save()

  // create datasource template for Pool
  PoolTemplate.create(event.params.pool)

  // increase numPools
  let reg = Registry.load('0')
  if (reg == null) {
    reg = new Registry('0')
    reg.numPools = Utils.ZERO_INT
  }
  reg.numPools = reg.numPools.plus(BigInt.fromI32(1))
  reg.save()
}
