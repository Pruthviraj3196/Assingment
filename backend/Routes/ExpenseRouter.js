const express = require('express');
const { getAllTransactions, addTransaction, deleteTransaction, filterTransactionsByDate, exportTransactionsToCSV }
    = require('../Controllers/ExpenseController');
const router = express.Router();

router.get('/', getAllTransactions);
router.post('/', addTransaction);
router.delete('/:expenseId', deleteTransaction);
router.get('/filter', filterTransactionsByDate);
router.get('/export', exportTransactionsToCSV);

module.exports = router;