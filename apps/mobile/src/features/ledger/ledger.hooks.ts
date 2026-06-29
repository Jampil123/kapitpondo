/**
 * features/ledger/ledger.hooks.ts
 * ----------------------------------------------------------------------------
 * The two manual ledger actions (M7). Both are sensitive — gate them tightly.
 *
 *   // Owner: reverse a wrong entry (reason required)
 *   const { run: reverse, error } = useReverseEntry(groupId);
 *   await reverse(entryId, 'Duplicate of #1234');   // error.status 409 if already reversed
 *
 *   // Owner/treasurer: manual adjustment (break-glass; show the reason)
 *   const { run: adjust } = usePostAdjustment(groupId);
 *   await adjust({ direction: 'credit', amount: toAmountString(input)!, reason });
 */
import { useAction } from '../../hooks/useApi';
import { reverseLedgerEntry, postAdjustment, type AdjustmentInput } from '../../api/ledger';

export function useReverseEntry(groupId: string) {
  return useAction((entryId: string, reason: string) =>
    reverseLedgerEntry(groupId, entryId, reason),
  );
}

export function usePostAdjustment(groupId: string) {
  return useAction((input: AdjustmentInput) => postAdjustment(groupId, input));
}