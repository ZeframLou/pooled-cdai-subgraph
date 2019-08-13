import { BigDecimal, BigInt, json, JSONValueKind, JSONValue } from "@graphprotocol/graph-ts";

export let ZERO_INT = BigInt.fromI32(0)
export let ZERO_DEC = BigDecimal.fromString('0')
export let PRECISION = new BigDecimal(tenPow(18))

export function tenPow(exponent: number): BigInt {
  let result = BigInt.fromI32(1)
  for (let i = 0; i < exponent; i++) {
    result = result.times(BigInt.fromI32(10))
  }
  return result
}

export function normalize(i: BigInt): BigDecimal {
  return i.toBigDecimal().div(PRECISION)
}