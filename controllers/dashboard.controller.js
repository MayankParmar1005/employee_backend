const pool = require('../db/db');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {

    // Current year to make the chart dynamic
    const currentYear = new Date().getFullYear();

    // Run queries simultaneously for maximum performance
    const [
      statsResult,         // Combined KPI metrics
      statusBreakdown,     // NEW: Today's Status breakdown counters
      recentAppointmentsResult,
      recentCustomersResult,
      monthlyRevenueResult // NEW: Chart Query
    ] = await Promise.all([
      
      // 1. Core KPIs (Total appointments, Total customers, Active staff)
      pool.query(`
        SELECT 
          (SELECT COUNT(*) FROM appointments WHERE appointment_date = CURRENT_DATE) AS todays_appointments,
          (SELECT COUNT(*) FROM customers) AS total_customers,
          (SELECT COUNT(*) FROM staff WHERE status = 'active') AS total_employees
      `),

      // 2. NEW: Today's Detailed Overview Status Breakdown & Total Revenue Collected
      pool.query(`
        SELECT 
          COUNT(CASE WHEN status = 'scheduled' THEN 1 END)::INT AS scheduled_count,
          COUNT(CASE WHEN status = 'completed' THEN 1 END)::INT AS completed_count,
          COUNT(CASE WHEN status = 'cancelled' THEN 1 END)::INT AS cancelled_count,
          COALESCE(SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END), 0)::FLOAT AS revenue_collected
        FROM appointments 
        WHERE appointment_date = CURRENT_DATE
      `),

      // 3. Recent 5 Appointments
      pool.query(`
        SELECT a.id, c.name AS customer_name, srv.name AS service_name, a.appointment_time, a.status
        FROM appointments a
        INNER JOIN customers c ON a.customer_id = c.id
        LEFT JOIN services srv ON a.service_id = srv.id
        ORDER BY a.created_at DESC, a.id DESC LIMIT 5
      `),

      // 4. Recent 5 Registered Customers
      pool.query(`
        SELECT c.id, c.name, c.mobile, c.created_at, COUNT(a.id)::INT AS total_visits
        FROM customers c
        LEFT JOIN appointments a ON c.id = a.customer_id
        GROUP BY c.id ORDER BY c.created_at DESC, c.id DESC LIMIT 5
      `),

      // 5. NEW: 12-Month Revenue Breakdown for the Chart
      pool.query(`
        SELECT 
          TO_CHAR(month_series, 'Mon') AS month,
          COALESCE(SUM(a.total_amount), 0)::FLOAT AS revenue
        FROM GENERATE_SERIES(
          TO_DATE($1 || '-01-01', 'YYYY-MM-DD'), 
          TO_DATE($1 || '-12-01', 'YYYY-MM-DD'), 
          '1 month'::interval
        ) AS month_series
        LEFT JOIN appointments a ON 
          EXTRACT(MONTH FROM a.appointment_date) = EXTRACT(MONTH FROM month_series)
          AND EXTRACT(YEAR FROM a.appointment_date) = $1::INT -- Added explicit cast here to match double precision/integer
          AND a.status = 'completed'
        GROUP BY month_series
        ORDER BY month_series ASC
      `, [currentYear])
    ]);

    const coreStats = statsResult.rows[0];
    const breakdown = statusBreakdown.rows[0];

    // Construct unified payload structure
    res.json({
      stats: {
        todaysAppointments: parseInt(coreStats.todays_appointments),
        todaysRevenue: breakdown.revenue_collected, // Shared revenue value
        totalCustomers: parseInt(coreStats.total_customers),
        totalEmployees: parseInt(coreStats.total_employees)
      },
      todayOverview: {
        scheduled: breakdown.scheduled_count,
        completed: breakdown.completed_count,
        cancelled: breakdown.cancelled_count,
        revenueCollected: breakdown.revenue_collected
      },
      recentAppointments: recentAppointmentsResult.rows,
      recentCustomers: recentCustomersResult.rows,
      monthlyRevenueChart: monthlyRevenueResult.rows // Array containing the 12 clean monthly records
    });

  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({ message: 'Error retrieving dashboard analytics data' });
  }
};