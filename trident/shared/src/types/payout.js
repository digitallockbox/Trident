/**
 * Payout status enum - matches backend Prisma enum
 */
export var PayoutStatus;
(function (PayoutStatus) {
    PayoutStatus["Pending"] = "PENDING";
    PayoutStatus["Processing"] = "PROCESSING";
    PayoutStatus["Completed"] = "COMPLETED";
    PayoutStatus["Failed"] = "FAILED";
    PayoutStatus["Cancelled"] = "CANCELLED";
})(PayoutStatus || (PayoutStatus = {}));
//# sourceMappingURL=payout.js.map