const UserModel = require("../Models/User");

const fs = require('fs');
const { format } = require('fast-csv');

const exportTransactionsToCSV = async (req, res) => {
    const { _id } = req.user;

    try {
        const userData = await UserModel.findById(_id).select('expenses');

        if (!userData || userData.expenses.length === 0) {
            return res.status(404).json({
                message: "No expenses found",
                success: false,
            });
        }

        // Prepare CSV data
        const expenses = userData.expenses.map(expense => ({
            Text: expense.text,
            Amount: expense.amount,
            Date: expense.createdAt.toISOString(),
        }));

        // Create a CSV stream
        const filePath = `./exports/expenses_${_id}.csv`;
        const writableStream = fs.createWriteStream(filePath);

        format.write(expenses, { headers: true }).pipe(writableStream);

        writableStream.on('finish', () => {
            res.download(filePath, `expenses_${_id}.csv`, err => {
                if (err) {
                    console.error("Error sending file:", err);
                }
                fs.unlinkSync(filePath); // Delete file after download
            });
        });
    } catch (err) {
        console.error("Error exporting transactions:", err);
        res.status(500).json({
            message: "Something went wrong",
            error: err.message,
            success: false,
        });
    }
};


const addTransaction = async (req, res) => {
    const { _id } = req.user;
    console.log(_id, req.body)
    try {
        const userData = await UserModel.findByIdAndUpdate(
            _id,
            { $push: { expenses: req.body } },
            { new: true } // For Returning the updated documents
        )
        res.status(200)
            .json({
                message: "Expense added successfully",
                success: true,
                data: userData?.expenses
            })
    } catch (err) {
        return res.status(500).json({
            message: "Something went wrong",
            error: err,
            success: false
        })
    }
}

const getAllTransactions = async (req, res) => {
    const { _id } = req.user;
    console.log(_id, req.body)
    try {
        const userData = await UserModel.findById(_id).select('expenses');
        res.status(200)
            .json({
                message: "Fetched Expenses successfully",
                success: true,
                data: userData?.expenses
            })
    } catch (err) {
        return res.status(500).json({
            message: "Something went wrong",
            error: err,
            success: false
        })
    }
}

const deleteTransaction = async (req, res) => {
    const { _id } = req.user;
    const expenseId = req.params.expenseId;
    try {
        const userData = await UserModel.findByIdAndUpdate(
            _id,
            { $pull: { expenses: { _id: expenseId } } },
            { new: true } // For Returning the updated documents
        )
        res.status(200)
            .json({
                message: "Expense Deleted successfully",
                success: true,
                data: userData?.expenses
            })
    } catch (err) {
        return res.status(500).json({
            message: "Something went wrong",
            error: err,
            success: false
        })
    }
}

const filterTransactionsByDate = async (req, res) => {
    const { _id } = req.user;
    const { startDate, endDate } = req.query;

    try {
        // Validate date inputs
        if (!startDate || !endDate) {
            return res.status(400).json({
                message: "Start and end dates are required",
                success: false,
            });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start) || isNaN(end)) {
            return res.status(400).json({
                message: "Invalid date format",
                success: false,
            });
        }

        // Fetch user expenses within the date range
        const userData = await UserModel.findById(_id).select('expenses');
        const filteredExpenses = userData.expenses.filter(expense => {
            const createdAt = new Date(expense.createdAt);
            return createdAt >= start && createdAt <= end;
        });

        res.status(200).json({
            message: "Filtered expenses fetched successfully",
            success: true,
            data: filteredExpenses,
        });
    } catch (err) {
        console.error("Error filtering transactions:", err);
        res.status(500).json({
            message: "Something went wrong",
            error: err.message,
            success: false,
        });
    }
};

module.exports = {
    addTransaction,
    getAllTransactions,
    deleteTransaction,
    filterTransactionsByDate,
    exportTransactionsToCSV
}