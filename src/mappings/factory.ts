import {
  CreatePoolWithMetadata as CreatePoolWithMetadataEvent,
  CreatePool as CreatePoolEvent
} from "../../generated/Factory/Factory"
import { Pool } from "../../generated/schema"
import { Pool as PoolContract } from "../../generated/Factory/Pool"
import { Pool as PoolTemplate } from "../../generated/Factory/templates"
import { json, JSONValueKind } from '@graphprotocol/graph-ts'
import * as Utils from '../utils'

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

  // read JSON metadata from IPFS
  let rawMeta = json.fromBytes(event.params.metadata)
  if (rawMeta.kind == JSONValueKind.OBJECT) {
    let meta = rawMeta.toObject()

    let description = meta.get('description')
    let ownershipProof = meta.get('ownershipProof')
    let logoUrl = meta.get('logoUrl')

    entity.description = description.kind == JSONValueKind.STRING ? description.toString() : ""
    entity.ownershipProof = ownershipProof.kind == JSONValueKind.STRING ? ownershipProof.toString() : ""
    entity.logoUrl = logoUrl.kind == JSONValueKind.STRING ? logoUrl.toString() : ""
  } else {
    entity.description = ""
    entity.ownershipProof = ""
    entity.logoUrl = ""
  }

  entity.save()

  // create datasource template for Pool
  PoolTemplate.create(event.params.pool)
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

  entity.description = ""
  entity.ownershipProof = ""
  entity.logoUrl = ""

  entity.save()

  // create datasource template for Pool
  PoolTemplate.create(event.params.pool)
}
