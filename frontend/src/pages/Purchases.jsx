import { useState, useEffect } from "react";

// ─── Mock Suppliers ───────────────────────────────────────────────────────────
const SUPPLIERS = [
  { id: 1, name: "Steel Pro Industries", contact: "supplier@steelpro.com" },
  { id: 2, name: "Polymer Solutions", contact: "orders@polymers.com" },
  { id: 3, name: "Copper & Metals Ltd", contact: "sales@coppermetals.com" },
  { id: 4, name: "Logistics Plus", contact: "procurement@logistics.com" },
];

const MATERIALS = [
  "Steel Rods",
  "Aluminium Sheet",
  "Copper Wire",
  "Polymer Pellets",
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Purchases() {
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem("procurement_orders");
    return saved ? JSON.parse(saved) : [
      {
        id: "PO-001",
        material: "Steel Rods",
        supplier: "Steel Pro Industries",
        quantity: 500,
        unit: "kg",
        expectedDate: "2026-04-10",
        status: "received",
        comments: [
          { time: "2026-04-08 10:30", text: "Order received in good condition" },
        ],
      },
      {
        id: "PO-002",
        material: "Polymer Pellets",
        supplier: "Polymer Solutions",
        quantity: 200,
        unit: "kg",
        expectedDate: "2026-04-15",
        status: "pending",
        comments: [
          { time: "2026-04-02 09:15", text: "Order placed, awaiting shipment" },
        ],
      },
    ];
  });

  const [formData, setFormData] = useState({
    material: "",
    supplier: "",
    quantity: "",
    unit: "kg",
    expectedDate: "",
    costPerUnit: "",
  });

  const [expandedOrder, setExpandedOrder] = useState(null);
  const [commentText, setCommentText] = useState({});

  // Persist orders to localStorage
  useEffect(() => {
    localStorage.setItem("procurement_orders", JSON.stringify(orders));
  }, [orders]);

  // Create new order
  const handleCreateOrder = () => {
    if (!formData.material || !formData.supplier || !formData.quantity || !formData.costPerUnit) {
      alert("Please fill in all required fields");
      return;
    }

    const qty = parseInt(formData.quantity);
    const costPerUnit = parseFloat(formData.costPerUnit);
    const totalCost = qty * costPerUnit;

    const newOrder = {
      id: `PO-${String(orders.length + 1).padStart(3, "0")}`,
      material: formData.material,
      supplier: formData.supplier,
      quantity: qty,
      unit: formData.unit,
      expectedDate: formData.expectedDate,
      costPerUnit: costPerUnit,
      totalCost: totalCost,
      status: "pending",
      comments: [
        {
          time: new Date().toLocaleString("en-GB"),
          text: "Order created",
        },
      ],
    };

    setOrders([...orders, newOrder]);
    setFormData({ material: "", supplier: "", quantity: "", unit: "kg", expectedDate: "", costPerUnit: "" });
  };

  // Update order status
  const handleStatusChange = (orderId, newStatus) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    // Update inventory if marked as received
    if (newStatus === "received") {
      updateInventory(orderId);
    }
  };

  // Update inventory
  const updateInventory = (orderId) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const inventory = JSON.parse(localStorage.getItem("inventory_items") || "[]");
    const existingItem = inventory.find((item) => item.name === order.material);

    if (existingItem) {
      existingItem.qty += order.quantity;
      existingItem.cost_per_unit = order.costPerUnit;
    } else {
      inventory.push({
        name: order.material,
        category: "raw",
        qty: order.quantity,
        unit: order.unit,
        threshold: 500,
        cost_per_unit: order.costPerUnit,
      });
    }
    localStorage.setItem("inventory_items", JSON.stringify(inventory));

    // Record cost in finances
    const finances = JSON.parse(localStorage.getItem("finances_data") || "{}");
    finances.procurementCost = (finances.procurementCost || 0) + order.totalCost;
    finances.purchaseHistory = (finances.purchaseHistory || []);
    finances.purchaseHistory.push({
      orderId: order.id,
      material: order.material,
      cost: order.totalCost,
      date: new Date().toLocaleDateString("en-GB"),
    });
    localStorage.setItem("finances_data", JSON.stringify(finances));
  };

  // Add comment
  const handleAddComment = (orderId) => {
    const text = commentText[orderId];
    if (!text || !text.trim()) return;

    setOrders(
      orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              comments: [
                ...order.comments,
                {
                  time: new Date().toLocaleString("en-GB"),
                  text: text,
                },
              ],
            }
          : order
      )
    );
    setCommentText({ ...commentText, [orderId]: "" });
  };

  const getStatusClass = (status) => {
    if (status === "pending") return "statusPending";
    if (status === "received") return "statusReceived";
    if (status === "partial") return "statusPartial";
    return "statusPending";
  };

  return (
    <div className="purchasesPage">
      {/* Header */}
      <div className="pageHeader">
        <div>
          <div className="pageTitle">Procurement</div>
          <div className="pageSubtitle">
            {orders.length} orders • {orders.filter((o) => o.status === "pending").length} pending
          </div>
        </div>
      </div>

      {/* Create Order Section */}
      <div className="section">
        <div className="sectionTitle">Create Purchase Order</div>
        <div className="formGrid">
          <div className="formGroup">
            <label className="label">Material</label>
            <select
              className="select"
              value={formData.material}
              onChange={(e) =>
                setFormData({ ...formData, material: e.target.value })
              }
            >
              <option value="">Select material</option>
              {MATERIALS.map((mat) => (
                <option key={mat} value={mat}>
                  {mat}
                </option>
              ))}
            </select>
          </div>

          <div className="formGroup">
            <label className="label">Supplier</label>
            <select
              className="select"
              value={formData.supplier}
              onChange={(e) =>
                setFormData({ ...formData, supplier: e.target.value })
              }
            >
              <option value="">Select supplier</option>
              {SUPPLIERS.map((sup) => (
                <option key={sup.id} value={sup.name}>
                  {sup.name}
                </option>
              ))}
            </select>
          </div>

          <div className="formGroup">
            <label className="label">Quantity</label>
            <input
              className="input"
              type="number"
              placeholder="Amount"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
              }
            />
          </div>

          <div className="formGroup">
            <label className="label">Unit</label>
            <select
              className="select"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            >
              <option value="kg">kg</option>
              <option value="m">m</option>
              <option value="pcs">pcs</option>
              <option value="l">l</option>
            </select>
          </div>
        </div>

        <div className="formGrid">
          <div className="formGroup">
            <label className="label">Expected Delivery</label>
            <input
              className="input"
              type="date"
              value={formData.expectedDate}
              onChange={(e) =>
                setFormData({ ...formData, expectedDate: e.target.value })
              }
            />
          </div>
          <div className="formGroup">
            <label className="label">Cost Per Unit (₹)</label>
            <input
              className="input"
              type="number"
              placeholder="Price per unit"
              value={formData.costPerUnit}
              onChange={(e) =>
                setFormData({ ...formData, costPerUnit: e.target.value })
              }
            />
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <button
              className="button"
              onClick={handleCreateOrder}
            >
              + Create Order
            </button>
            {formData.quantity && formData.costPerUnit && (
              <div style={{ fontSize: 10, color: "#666666" }}>
                Total: ₹{(parseInt(formData.quantity) * parseFloat(formData.costPerUnit || 0)).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="section">
        <div className="sectionTitle">Purchase Orders</div>
        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr>
                <th className="th">Order ID</th>
                <th className="th">Material</th>
                <th className="th">Supplier</th>
                <th className="th">Quantity</th>
                <th className="th">Cost Per Unit</th>
                <th className="th">Total Cost</th>
                <th className="th">Status</th>
                <th className="th">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f9f9f9")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                  style={{ cursor: "pointer", transition: "background 0.1s" }}
                >
                  <td className="td">{order.id}</td>
                  <td className="td">{order.material}</td>
                  <td className="td">{order.supplier}</td>
                  <td className="td">
                    {order.quantity} {order.unit}
                  </td>
                  <td className="td">₹{order.costPerUnit?.toLocaleString() || "—"}</td>
                  <td className="td" style={{ fontWeight: 700, color: "#c84a3a" }}>
                    ₹{order.totalCost?.toLocaleString() || "—"}
                  </td>
                  <td className="td">
                    <span className={`statusBadge ${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="td">
                    <button
                      className="buttonSecondary"
                      onClick={() =>
                        setExpandedOrder(
                          expandedOrder === order.id ? null : order.id
                        )
                      }
                    >
                      {expandedOrder === order.id ? "▼" : "▶"} Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Expanded Order Details */}
        {expandedOrder && (
          <div className="orderDetail">
            {(() => {
              const order = orders.find((o) => o.id === expandedOrder);
              return (
                <>
                  <div className="orderHeader">
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a" }}>
                        {order.id} - {order.material}
                      </div>
                      <div className="orderMeta">
                        Supplier: {order.supplier} | Expected: {order.expectedDate}
                      </div>
                    </div>
                    <div className="orderActions">
                      <button
                        className={`buttonSmall buttonReceived`}
                        onClick={() =>
                          handleStatusChange(order.id, "received")
                        }
                      >
                        ✓ Mark Received
                      </button>
                      <button
                        className={`buttonSmall buttonPending`}
                        onClick={() =>
                          handleStatusChange(order.id, "pending")
                        }
                      >
                        ✗ Pending
                      </button>
                    </div>
                  </div>

                  {/* Comments Section */}
                  <div className="commentSection">
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#1a1a1a",
                        marginBottom: 8,
                      }}
                    >
                      Comments
                    </div>
                    <textarea
                      className="commentInput"
                      style={{
                        minHeight: 60,
                        resize: "vertical",
                      }}
                      placeholder="Add a comment..."
                      value={commentText[order.id] || ""}
                      onChange={(e) =>
                        setCommentText({
                          ...commentText,
                          [order.id]: e.target.value,
                        })
                      }
                    />
                    <button
                      className="button"
                      style={{
                        padding: "6px 12px",
                        fontSize: 10,
                      }}
                      onClick={() => handleAddComment(order.id)}
                    >
                      Add Comment
                    </button>

                    <div className="commentList">
                      {order.comments.map((comment, i) => (
                        <div key={i} className="comment">
                          <div className="commentTime">{comment.time}</div>
                          <div className="commentText">{comment.text}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
