import {
  CreatePoolWithMetadata as CreatePoolWithMetadataEvent,
  CreatePool as CreatePoolEvent
} from "../../generated/Factory/Factory"
import { Pool, Registry } from "../../generated/schema"
import { Pool as PoolContract } from "../../generated/Factory/Pool"
import { Pool as PoolTemplate } from "../../generated/Factory/templates"
import * as Utils from '../utils'
import { BigInt } from "@graphprotocol/graph-ts";

export function handleCreatePoolWithMetadata(
  event: CreatePoolWithMetadataEvent
): void {
  // create Pool entity
  let entity = new Pool(event.params.pool.toHex())
  let contract = PoolContract.bind(event.params.pool)
  entity.totalSupply = Utils.ZERO_DEC
  entity.totalSupplyHistory = new Array<string>()
  entity.totalInterestWithdrawn = Utils.ZERO_DEC
  entity.totalInterestWithdrawnHistory = new Array<string>()
  entity.beneficiary = contract.beneficiary().toHex()
  entity.creator = event.params.sender.toHex()
  entity.creationTimestamp = event.block.timestamp
  entity.owner = contract.owner().toHex()
  entity.name = contract.name()
  entity.symbol = contract.symbol()

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
  entity.totalSupply = Utils.ZERO_DEC
  entity.totalSupplyHistory = new Array<string>()
  entity.totalInterestWithdrawn = Utils.ZERO_DEC
  entity.totalInterestWithdrawnHistory = new Array<string>()
  entity.beneficiary = contract.beneficiary().toHex()
  entity.creator = event.params.sender.toHex()
  entity.creationTimestamp = event.block.timestamp
  entity.owner = contract.owner().toHex()
  entity.name = contract.name()
  entity.symbol = contract.symbol()

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
