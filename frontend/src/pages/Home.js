import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { APIUrl, handleError, handleSuccess } from '../utils';
import { ToastContainer } from 'react-toastify';
import ExpenseTable from './ExpenseTable';
import ExpenseDetails from './ExpenseDetails';
import ExpenseForm from './ExpenseForm';
import { CSVLink } from 'react-csv';

function Home() {
    const [loggedInUser, setLoggedInUser] = useState('');
    const [expenses, setExpenses] = useState([]);
    const [incomeAmt, setIncomeAmt] = useState(0);
    const [expenseAmt, setExpenseAmt] = useState(0);
    const [filterCategory, setFilterCategory] = useState('');
    const [filterDate, setFilterDate] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        setLoggedInUser(localStorage.getItem('loggedInUser'));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('loggedInUser');
        handleSuccess('User Logged out');
        setTimeout(() => {
            navigate('/login');
        }, 1000);
    };

    useEffect(() => {
        const amounts = expenses.map((item) => item.amount);
        const income = amounts.filter((item) => item > 0).reduce((acc, item) => (acc += item), 0);
        const exp = amounts.filter((item) => item < 0).reduce((acc, item) => (acc += item), 0) * -1;
        setIncomeAmt(income);
        setExpenseAmt(exp);
    }, [expenses]);

    const deleteExpens = async (id) => {
        try {
            const url = `${APIUrl}/expenses/${id}`;
            const headers = {
                headers: {
                    Authorization: localStorage.getItem('token'),
                },
                method: 'DELETE',
            };
            const response = await fetch(url, headers);
            if (response.status === 403) {
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }
            const result = await response.json();
            handleSuccess(result?.message);
            setExpenses(result.data);
        } catch (err) {
            handleError(err);
        }
    };

    const fetchExpenses = async () => {
        try {
            const url = `${APIUrl}/expenses`;
            const headers = {
                headers: {
                    Authorization: localStorage.getItem('token'),
                },
            };
            const response = await fetch(url, headers);
            if (response.status === 403) {
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }
            const result = await response.json();
            setExpenses(result.data);
        } catch (err) {
            handleError(err);
        }
    };

    const addTransaction = async (data) => {
        try {
            const url = `${APIUrl}/expenses`;
            const headers = {
                headers: {
                    Authorization: localStorage.getItem('token'),
                    'Content-Type': 'application/json',
                },
                method: 'POST',
                body: JSON.stringify(data),
            };
            const response = await fetch(url, headers);
            if (response.status === 403) {
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }
            const result = await response.json();
            handleSuccess(result?.message);
            setExpenses(result.data);
        } catch (err) {
            handleError(err);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    const filteredExpenses = expenses.filter((expense) => {
        const matchesCategory = filterCategory ? expense.category === filterCategory : true;
        const matchesDate = filterDate ? expense.date === filterDate : true;
        return matchesCategory && matchesDate;
    });

    return (
        <div>
            <div className='user-section'>
                <h1>Welcome {loggedInUser}</h1>
                <button onClick={handleLogout}>Logout</button>
            </div>

            <div className='filter-section'>
                <label>
                    Filter by Category:
                    <input
                        type='text'
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                    />
                </label>
                <label>
                    Filter by Date:
                    <input
                        type='date'
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                    />
                </label>
                <CSVLink data={filteredExpenses} filename={'expenses.csv'} className='btn btn-primary'>
                    Export to CSV
                </CSVLink>
            </div>

            <ExpenseDetails incomeAmt={incomeAmt} expenseAmt={expenseAmt} />

            <ExpenseForm addTransaction={addTransaction} />

            <ExpenseTable expenses={filteredExpenses} deleteExpens={deleteExpens} />

            <ToastContainer />
        </div>
    );
}

export default Home;
