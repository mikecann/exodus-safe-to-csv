

export type SAFECoinTransactions = SAFECoinTransaction[];

export type SAFECoinTransaction = {
  txId: string,
  date: string,
  coinAmount: string,
  feeAmount: string,
  coinName: string
}

export type TransactionCSVRow = {
  TXID: string,
  TXURL: string,
  DATE: string,
  COINAMOUNT: string,
  FEE: string,
  BALANCE: string
  EXCHANGE: string,
  MEMO: string
}