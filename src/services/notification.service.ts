import { Booking, Invoice, Lead, Quotation, BusinessAlert } from '../types';
import { formatIndianCurrency, formatBusinessDate } from '../utils/calculations';

export class NotificationService {
  public static getBusinessAlerts(data: {
    bookings: Booking[];
    invoices: Invoice[];
    leads: Lead[];
    quotations: Quotation[];
  }): BusinessAlert[] {
    const alerts: BusinessAlert[] = [];
    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // 1. Moves Scheduled Today
    const todayMoves = data.bookings.filter(
      (b) => b.movingDate === todayStr && b.status !== 'Completed' && b.status !== 'Cancelled'
    );
    if (todayMoves.length > 0) {
      alerts.push({
        id: `alert-today-moves`,
        type: 'urgent',
        category: 'move',
        title: `${todayMoves.length} Move${todayMoves.length > 1 ? 's' : ''} Scheduled Today`,
        message: `Dispatch active today: ${todayMoves.map((m) => m.bookingNumber).join(', ')}`,
        link: '/bookings',
        actionLabel: 'View Dispatch',
        timestamp: todayStr,
      });
    }

    // 2. Moves Scheduled Tomorrow
    const tomorrowMoves = data.bookings.filter(
      (b) => b.movingDate === tomorrowStr && b.status !== 'Completed' && b.status !== 'Cancelled'
    );
    if (tomorrowMoves.length > 0) {
      alerts.push({
        id: `alert-tomorrow-moves`,
        type: 'info',
        category: 'move',
        title: `${tomorrowMoves.length} Move${tomorrowMoves.length > 1 ? 's' : ''} Scheduled Tomorrow`,
        message: `Ensure vehicle & labour crew are verified for tomorrow's pickups`,
        link: '/bookings',
        actionLabel: 'Check Fleet',
        timestamp: tomorrowStr,
      });
    }

    // 3. Unassigned Drivers / Vehicles
    const unassignedMoves = data.bookings.filter(
      (b) =>
        (b.status === 'Confirmed' || b.status === 'Packing') &&
        (!b.driver || b.driver.toLowerCase().includes('assigned') || !b.vehicle)
    );
    if (unassignedMoves.length > 0) {
      alerts.push({
        id: `alert-unassigned-crew`,
        type: 'warning',
        category: 'crew',
        title: `${unassignedMoves.length} Order${unassignedMoves.length > 1 ? 's' : ''} Missing Crew/Driver`,
        message: `Assign fleet drivers and helpers before pickup time`,
        link: '/bookings',
        actionLabel: 'Assign Crew',
        timestamp: todayStr,
      });
    }

    // 4. Overdue Invoices
    const overdueInvoices = data.invoices.filter(
      (i) => i.balanceDue > 0 && i.dueDate && new Date(i.dueDate) < new Date(todayStr)
    );
    if (overdueInvoices.length > 0) {
      const totalOverdue = overdueInvoices.reduce((sum, i) => sum + i.balanceDue, 0);
      alerts.push({
        id: `alert-overdue-invoices`,
        type: 'urgent',
        category: 'payment',
        title: `${overdueInvoices.length} Overdue Invoice${overdueInvoices.length > 1 ? 's' : ''}`,
        message: `Outstanding due of ${formatIndianCurrency(totalOverdue)} requires customer follow-up`,
        link: '/invoices',
        actionLabel: 'Collect Dues',
        timestamp: todayStr,
      });
    }

    // 5. Hot Leads needing Follow-up
    const followUpLeads = data.leads.filter((l) => l.status === 'New' || l.status === 'Follow-up');
    if (followUpLeads.length > 0) {
      alerts.push({
        id: `alert-followup-leads`,
        type: 'info',
        category: 'lead',
        title: `${followUpLeads.length} Lead${followUpLeads.length > 1 ? 's' : ''} Pending Response`,
        message: `Call or WhatsApp client inquiries to maximize deal conversion`,
        link: '/leads',
        actionLabel: 'Open CRM',
        timestamp: todayStr,
      });
    }

    return alerts;
  }
}
