import {
  CreatePoolWithMetadata as CreatePoolWithMetadataEvent,
  CreatePool as CreatePoolEvent
} from "../generated/Contract/Contract"
import { CreatePoolWithMetadata, CreatePool } from "../generated/schema"

export function handleCreatePoolWithMetadata(
  event: CreatePoolWithMetadataEvent
): void {
  let entity = new CreatePoolWithMetadata(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.sender = event.params.sender
  entity.pool = event.params.pool
  entity.renounceOwnership = event.params.renounceOwnership
  entity.metadata = event.params.metadata
  entity.save()
}

export function handleCreatePool(event: CreatePoolEvent): void {
  let entity = new CreatePool(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.sender = event.params.sender
  entity.pool = event.params.pool
  entity.renounceOwnership = event.params.renounceOwnership
  entity.save()
}
