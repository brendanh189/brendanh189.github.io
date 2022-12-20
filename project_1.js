import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jwtDecode from 'jwt-decode';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setUser(jwtDecode(token));
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    axios.post('/api/login', { email, password })
      .then(response => {
        localStorage.setItem('token', response.data.token);
        setUser(jwtDecode(response.data.token));
      })
      .catch(error => {
        setError(error.response.data.message);
      });
  }

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  }

  const fetchTransactions = () => {
    axios.get('/api/transactions', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
      .then(response => {
        setTransactions(response.data);
      })
      .catch(error => {
        setError(error.response.data.message);
      });
  }

  const addTransaction = (event) => {
    event.preventDefault();
    axios.post('/api/transactions', {
      description: event.target.elements.description.value,
      amount: event.target.elements.amount.value
    }, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
      .then(response => {
        setTransactions([...transactions, response.data]);
      })
      .catch(error => {
        setError(error.response.data.message);
      });
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      {error && <p>{error}</p>}
      {user ? (
        <>
          <p>Welcome, {user.email}</p>
          <button onClick={logout}>Logout</button>
          <button onClick={fetchTransactions}>Refresh Transactions</button>
          <ul>
            {transactions.map(transaction => (
              <li key={transaction.id}>{transaction.description}: {transaction.amount}</li>
            ))}
          </ul>
          <form onSubmit={addTransaction}>
            <label htmlFor="description">Description:</label>
            <input type="text" name="description" />
            <label htmlFor="amount">Amount:</label
