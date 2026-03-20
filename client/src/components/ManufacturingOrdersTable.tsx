/**
 * Manufacturing Orders Table Component
 * Design: Nature-Inspired Manufacturing CRM
 * - Displays recent manufacturing orders
 * - Progress bars linked to Odoo stages
 * - Responsive table layout
 */

import { ManufacturingOrder } from '@/lib/mockData';
import { formatUnits } from '@/lib/formatters';
import { Package } from 'lucide-react';

interface ManufacturingOrdersTableProps {
  orders: ManufacturingOrder[];
}

const stageColors = {
  Draft: 'bg-gray-100 text-gray-800',
  Confirmed: 'bg-blue-100 text-blue-800',
  'To Close': 'bg-green-100 text-green-800',
};

export default function ManufacturingOrdersTable({
  orders,
}: ManufacturingOrdersTableProps) {
  return (
    <div className="card-gradient rounded-lg p-6 border border-sage-green/20">
      <div className="flex items-center gap-2 mb-6">
        <Package className="w-5 h-5 text-deep-green" />
        <h2 className="display-text text-lg text-charcoal">
          Recent Manufacturing Orders
        </h2>
      </div>

      {/* Table wrapper with horizontal scroll on mobile */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-sage-green/20">
              <th className="text-left py-3 px-4 font-medium text-soft-wood">
                Order ID
              </th>
              <th className="text-left py-3 px-4 font-medium text-soft-wood">
                Product
              </th>
              <th className="text-left py-3 px-4 font-medium text-soft-wood">
                Scent
              </th>
              <th className="text-right py-3 px-4 font-medium text-soft-wood">
                Quantity
              </th>
              <th className="text-left py-3 px-4 font-medium text-soft-wood">
                Stage
              </th>
              <th className="text-left py-3 px-4 font-medium text-soft-wood">
                Progress
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-sage-green/10 hover:bg-light-sage/30 transition-all duration-300 ease-in-out"
              >
                <td className="py-4 px-4 font-medium text-charcoal">
                  {order.id}
                </td>
                <td className="py-4 px-4 text-charcoal">{order.product}</td>
                <td className="py-4 px-4 text-charcoal">{order.scent}</td>
                <td className="py-4 px-4 text-right text-charcoal">
                  {formatUnits(order.quantity)}
                </td>
                <td className="py-4 px-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      stageColors[order.stage]
                    }`}
                  >
                    {order.stage}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-sage-green/30 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-deep-green h-full rounded-full transition-all duration-300"
                        style={{ width: `${order.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-8 text-right">
                      {order.progress}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty state message */}
      {orders.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No manufacturing orders found</p>
        </div>
      )}
    </div>
  );
}
