import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Container, Row, Col, Card, Table, Spinner } from "react-bootstrap";

import expenseService from "../services/expenseService";
import groupService from "../services/groupService";
import debtService from "../services/debtService";
import userService from "../services/userService";

import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";

const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(false); // ✅ Loading state
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalGroups, setTotalGroups] = useState(0);
  const [pendingPayments, setPendingPayments] = useState(0);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [balances, setBalances] = useState([]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true); // ✅ Show spinner

      try {
        const [summary, expenses, groups, debts] = await Promise.all([
          expenseService.getExpenseSummary(user.id),
          expenseService.getRecentExpenses(user.id),
          groupService.getUserGroups(user.id),
          debtService.getUserDebts(user.id),
        ]);

        // ✅ Expense Summary
        setTotalExpenses(summary.totalExpense);
        setTotalBalance(summary.totalBalance);
        setPendingPayments(summary.pendingPayments || 0);

        // ✅ Recent Expenses with Group Details
        const expensesWithGroupDetails = await Promise.all(
          expenses.map(async (expense) => {
            const groupData = await groupService.getGroupById(expense.groupId);
            return {
              ...expense,
              groupName: groupData?.name || "Unknown Group",
              groupDescription: groupData?.description || "No Description",
            };
          })
        );
        setRecentExpenses(expensesWithGroupDetails);

        // ✅ Groups with Members
        const groupsWithMembers = groups.map((group) => ({
          ...group,
          members:
            group.members.map((member) => member.name).join(", ") ||
            "No Members",
        }));
        setMyGroups(groupsWithMembers);
        setTotalGroups(groupsWithMembers.length);

        // ✅ Balances with User Names
        const balancesWithNames = await Promise.all(
          debts.map(async (debt) => {
            const userData = await userService.getUserById(debt.owedByUserId);
            return { ...debt, name: userData.name };
          })
        );
        setBalances(balancesWithNames);

        // ✅ Calculate Pending Payments
        const pendingAmount = balancesWithNames
          .filter((debt) => debt.amount < 0)
          .reduce((sum, debt) => sum + Math.abs(debt.amount), 0);
        setPendingPayments(pendingAmount);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false); // ✅ Hide spinner
      }
    };

    fetchData();
  }, [user]);

  return (
    <Container className="dashboard-container">
      <h2 className="dashboard-title">Dashboard</h2>
      <p className="dashboard-subtitle">
        Welcome back, {user?.name || "User"}! Here's an overview of your
        expenses.
      </p>

      {/* 🔹 Show Spinner while Loading */}
      {loading ? (
        <div className="text-center my-4">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <>
          <Row className="summary-section">
            <Col md={3}>
              <Card className="summary-card">
                <Card.Body>
                  <h5>Total Expenses</h5>
                  <h3>${totalExpenses}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="summary-card">
                <Card.Body>
                  <h5>Total Balance</h5>
                  <h3
                    className={
                      totalBalance < 0 ? "negative-balance" : "positive-balance"
                    }
                  >
                    ${totalBalance}
                  </h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="summary-card">
                <Card.Body>
                  <h5>Groups</h5>
                  <h3>{totalGroups}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="summary-card">
                <Card.Body>
                  <h5>Pending Payments</h5>
                  <h3>${pendingPayments.toFixed(2)}</h3>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <h4 className="section-title">Recent Expenses</h4>
          <Table striped bordered hover className="expenses-table">
            <thead>
              <tr>
                <th>Group</th>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentExpenses.length > 0 ? (
                recentExpenses.map((expense, index) => (
                  <tr key={index}>
                    <td>{expense?.groupName || "Unknown"}</td>
                    <td>{expense?.description || "No Description"}</td>
                    <td>${expense?.amount || "0.00"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">
                    No expenses found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          <h4 className="section-title">My Groups</h4>
          <Row>
            {myGroups.map((group) => (
              <Col md={4} key={group.id}>
                <Card className="group-card">
                  <Card.Body>
                    <h5>{group.name}</h5>
                    <p>
                      <strong>Members:</strong> {group.members}
                    </p>
                    <p>
                      <strong>Total Spent:</strong> ${group.totalSpent}
                    </p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          <h4 className="section-title">Who Owes Who?</h4>
          <Table striped bordered className="balances-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {balances.length > 0 ? (
                balances.map((balance, index) => (
                  <tr key={index}>
                    <td>{balance.name}</td>
                    <td
                      className={
                        balance.amount < 0
                          ? "negative-balance"
                          : "positive-balance"
                      }
                    >
                      {balance.amount < 0
                        ? `You owe $${Math.abs(balance.amount)}`
                        : `Owes you $${balance.amount}`}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="text-center">
                    No balances found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </>
      )}
    </Container>
  );
};

export default DashboardPage;
