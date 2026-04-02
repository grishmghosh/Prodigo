import { useState, useEffect } from "react";

export default function Sales() {
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem("sales_orders");
    return saved ? JSON.parse(saved) : [
      {
        id: "SO-001",
        product: "Assembled Unit A",
        quantity: 50,
        unit: "units",
        unitPrice: 450,
        totalPrice: 22500,
        date: "2026-04-01",
        status: "completed",
        comments: [
          { time: "2026-04-01 10:00", text: "Order shipped - Invoice generated" },
        ],
      },
    ];
  });

  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem("inventory_items");
    return saved ? JSON.parse(saved) : [];
  });

  const [formData, setFormData] = useState({
    product: "",
    quantity: "",
    unitPrice: "",
  });

  const [expandedOrder, setExpandedOrder] = useState(null);
  const [commentText, setCommentText] = useState({});

  // Get finished products from inventory
  const finishedProducts = inventory.filter((i) => i.category === "finished");

  // Persist orders
  useEffect(() => {
    localStorage.setItem("sales_orders", JSON.stringify(orders));
  }, [orders]);

  // Create new sales order
  const handleCreateOrder = () => {
    if (!formData.product || !formData.quantity || !formData.unitPrice) {
      alert("Please fill in all required fields");
      return;
    }

    const qty = parseInt(formData.quantity);
    const price = parseFloat(formData.unitPrice);
    const product = finishedProducts.find((p) => p.name === formData.product);

    if (!product) {
      alert("Product not found");
      return;
    }

    if (product.qty < qty) {
      alert(`Insufficient inventory. Available: ${product.qty}`);
      return;
    }

    // Create order
    const newOrder = {
      id: `SO-${String(orders.length + 1).padStart(3, "0")}`,
      product: formData.product,
      quantity: qty,
      unit: product.unit,
      unitPrice: price,
      totalPrice: qty * price,
      date: new Date().toLocaleDateString("en-GB"),
      status: "completed",
      comments: [
        {
          time: new Date().toLocaleString("en-GB"),
          text: "Order created",
        },
      ],
    };

    // Reduce finished inventory
    const updatedInventory = inventory.map((item) =>
      item.name === formData.product
        ? { ...item, qty: item.qty - qty }
        : item
    );
    setInventory(updatedInventory);
    localStorage.setItem("inventory_items", JSON.stringify(updatedInventory));

    // Record income in finances
    const finances = JSON.parse(localStorage.getItem("finances_data") || "{}");
    finances.income = (finances.income || 0) + (qty * price);
    finances.salesHistory = (finances.salesHistory || []);
    finances.salesHistory.push({
      orderId: newOrder.id,
      product: formData.product,
      amount: qty * price,
      date: newOrder.date,
    });
    localStorage.setItem("finances_data", JSON.stringify(finances));

    setOrders([...orders, newOrder]);
    setFormData({ product: "", quantity: "", unitPrice: "" });
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

  return (
    <div className="purchasesPage">
      <div className="pageHeader">
        <div>
          <div className="pageTitle">Sales</div>
          <div className="pageSubtitle">
            {orders.length} orders • Revenue: ₹{orders.reduce((sum, o) => sum + o.totalPrice, 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Create Sales Order */}
      <div className="section">
        <div className="sectionTitle">Create Sales Order</div>
        <div className="formGrid">
          <div className="formGroup">
            <label className="label">Finished Product</label>
            <select
              className="select"
              value={formData.product}
              onChange={(e) => setFormData({ ...formData, product: e.target.value })}
            >
              <option value="">Select product</option>
              {finishedProducts.map((prod) => (
                <option key={prod.name} value={prod.name}>
                  {prod.name} (Available: {prod.qty})
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
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            />
          </div>

          <div className="formGroup">
            <label className="label">Unit Price (₹)</label>
            <input
              className="input"
              type="number"
              placeholder="Price per unit"
              value={formData.unitPrice}
              onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
            />
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <button className="button" onClick={handleCreateOrder}>
              + Create Order
            </button>
            {formData.quantity && formData.unitPrice && (
              <div style={{ fontSize: 11, color: "#666666" }}>
                Total: ₹{(parseInt(formData.quantity) * parseFloat(formData.unitPrice || 0)).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sales Orders */}
      <div className="section">
        <div className="sectionTitle">Sales Orders</div>
        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr>
                <th className="th">Order ID</th>
                <th className="th">Product</th>
                <th className="th">Quantity</th>
                <th className="th">Unit Price</th>
                <th className="th">Total</th>
                <th className="th">Date</th>
                <th className="th">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f9f9f9")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  style={{ cursor: "pointer", transition: "background 0.1s" }}
                >
                  <td className="td">{order.id}</td>
                  <td className="td">{order.product}</td>
                  <td className="td">{order.quantity} {order.unit}</td>
                  <td className="td">₹{order.unitPrice.toLocaleString()}</td>
                  <td className="td" style={{ fontWeight: 700 }}>
                    ₹{order.totalPrice.toLocaleString()}
                  </td>
                  <td className="td">{order.date}</td>
                  <td className="td">
                    <button
                      className="buttonSecondary"
                      onClick={() =>
                        setExpandedOrder(expandedOrder === order.id ? null : order.id)
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

        {/* Order Details */}
        {expandedOrder && (
          <div className="orderDetail">
            {(() => {
              const order = orders.find((o) => o.id === expandedOrder);
              return (
                <>
                  <div className="orderHeader">
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a" }}>
                        {order.id} - {order.product}
                      </div>
                      <div className="orderMeta">
                        Qty: {order.quantity} {order.unit} @ ₹{order.unitPrice} = ₹{order.totalPrice.toLocaleString()} | Date: {order.date}
                      </div>
                    </div>
                    <span className="statusBadge statusReceived">✓ Completed</span>
                  </div>

                  <div className="commentSection">
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#1a1a1a", marginBottom: 8 }}>
                      Comments
                    </div>
                    <textarea
                      className="commentInput"
                      style={{ minHeight: 60, resize: "vertical" }}
                      placeholder="Add a comment..."
                      value={commentText[order.id] || ""}
                      onChange={(e) => setCommentText({ ...commentText, [order.id]: e.target.value })}
                    />
                    <button
                      className="button"
                      style={{ padding: "6px 12px", fontSize: 10 }}
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
