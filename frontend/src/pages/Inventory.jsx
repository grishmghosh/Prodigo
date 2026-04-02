import { useState, useEffect } from "react";

export default function Inventory() {
  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem("inventory_items");
    return saved ? JSON.parse(saved) : [];
  });

  const [procedures, setProcedures] = useState({
    pendingOrders: [],
    productionBatches: [],
    salesOrders: [],
  });

  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(() => {
    const saved = localStorage.getItem("inventory_comments");
    return saved ? JSON.parse(saved) : [];
  });

  // Load all procedures from localStorage
  useEffect(() => {
    const procurementOrders = JSON.parse(localStorage.getItem("procurement_orders") || "[]");
    const productionBatches = JSON.parse(localStorage.getItem("production_batches") || "[]");
    const salesOrders = JSON.parse(localStorage.getItem("sales_orders") || "[]");

    setProcedures({
      pendingOrders: procurementOrders.filter((o) => o.status === "pending"),
      productionBatches: productionBatches.filter((b) => b.status === "completed"),
      salesOrders: salesOrders.filter((s) => s.status === "completed"),
    });
  }, []);

  // Persist comments
  useEffect(() => {
    localStorage.setItem("inventory_comments", JSON.stringify(comments));
  }, [comments]);

  // Add comment
  const handleAddComment = () => {
    if (!commentText.trim()) return;

    const newComment = {
      time: new Date().toLocaleString("en-GB"),
      text: commentText,
    };

    setComments([...comments, newComment]);
    setCommentText("");
  };

  // Calculate total inventory value
  const totalValue = inventory.reduce((sum, item) => {
    const cost = item.cost_per_unit ? item.qty * item.cost_per_unit : 0;
    return sum + cost;
  }, 0);

  // Separate raw and finished
  const rawMaterials = inventory.filter((i) => i.category === "raw");
  const finishedGoods = inventory.filter((i) => i.category === "finished");

  return (
    <div className="purchasesPage">
      <div className="pageHeader">
        <div>
          <div className="pageTitle">Inventory</div>
          <div className="pageSubtitle">
            {inventory.length} items • Value: ₹{totalValue.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Inventory Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        <div className="section" style={{ padding: 16, marginBottom: 0 }}>
          <div style={{ fontSize: 10, color: "#999999", textTransform: "uppercase", marginBottom: 8 }}>
            Raw Materials
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#1a1a1a" }}>
            {rawMaterials.length}
          </div>
          <div style={{ fontSize: 10, color: "#666666", marginTop: 8 }}>
            Total units: {rawMaterials.reduce((sum, m) => sum + m.qty, 0)}
          </div>
        </div>

        <div className="section" style={{ padding: 16, marginBottom: 0 }}>
          <div style={{ fontSize: 10, color: "#999999", textTransform: "uppercase", marginBottom: 8 }}>
            Finished Goods
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#1a1a1a" }}>
            {finishedGoods.length}
          </div>
          <div style={{ fontSize: 10, color: "#666666", marginTop: 8 }}>
            Total units: {finishedGoods.reduce((sum, g) => sum + g.qty, 0)}
          </div>
        </div>

        <div className="section" style={{ padding: 16, marginBottom: 0 }}>
          <div style={{ fontSize: 10, color: "#999999", textTransform: "uppercase", marginBottom: 8 }}>
            Pending Procurement
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#c84a3a" }}>
            {procedures.pendingOrders.length}
          </div>
          <div style={{ fontSize: 10, color: "#666666", marginTop: 8 }}>
            Orders awaiting receipt
          </div>
        </div>

        <div className="section" style={{ padding: 16, marginBottom: 0 }}>
          <div style={{ fontSize: 10, color: "#999999", textTransform: "uppercase", marginBottom: 8 }}>
            Active Procedures
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#e8821a" }}>
            {procedures.productionBatches.length + procedures.salesOrders.length}
          </div>
          <div style={{ fontSize: 10, color: "#666666", marginTop: 8 }}>
            Production + Sales
          </div>
        </div>
      </div>

      {/* Raw Materials */}
      {rawMaterials.length > 0 && (
        <div className="section">
          <div className="sectionTitle">Raw Materials</div>
          <div className="tableWrap">
            <table className="table">
              <thead>
                <tr>
                  <th className="th">Material</th>
                  <th className="th">Available Qty</th>
                  <th className="th">Unit</th>
                  <th className="th">Threshold</th>
                  <th className="th">Cost/Unit</th>
                  <th className="th">Total Value</th>
                  <th className="th">Status</th>
                </tr>
              </thead>
              <tbody>
                {rawMaterials.map((item) => {
                  const isLow = item.qty < (item.threshold || 500);
                  const statusColor = isLow ? "#c84a3a" : "#3a8a5a";
                  const totalValue = item.qty * (item.cost_per_unit || 0);

                  return (
                    <tr
                      key={item.name}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f9f9f9")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      style={{ transition: "background 0.1s" }}
                    >
                      <td className="td">{item.name}</td>
                      <td className="td" style={{ fontWeight: 700, color: "#1a1a1a" }}>
                        {item.qty}
                      </td>
                      <td className="td">{item.unit}</td>
                      <td className="td">{item.threshold || "—"}</td>
                      <td className="td">₹{(item.cost_per_unit || 0).toLocaleString()}</td>
                      <td className="td" style={{ fontWeight: 700 }}>
                        ₹{totalValue.toLocaleString()}
                      </td>
                      <td className="td">
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            color: statusColor,
                            textTransform: "uppercase",
                          }}
                        >
                          {isLow ? "⚠ Low Stock" : "✓ OK"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Finished Goods */}
      {finishedGoods.length > 0 && (
        <div className="section">
          <div className="sectionTitle">Finished Goods</div>
          <div className="tableWrap">
            <table className="table">
              <thead>
                <tr>
                  <th className="th">Product</th>
                  <th className="th">Available Qty</th>
                  <th className="th">Unit</th>
                  <th className="th">Threshold</th>
                  <th className="th">Cost/Unit</th>
                  <th className="th">Total Value</th>
                  <th className="th">Status</th>
                </tr>
              </thead>
              <tbody>
                {finishedGoods.map((item) => {
                  const isLow = item.qty < (item.threshold || 100);
                  const statusColor = isLow ? "#c84a3a" : "#3a8a5a";
                  const totalValue = item.qty * (item.cost_per_unit || 0);

                  return (
                    <tr
                      key={item.name}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f9f9f9")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      style={{ transition: "background 0.1s" }}
                    >
                      <td className="td">{item.name}</td>
                      <td className="td" style={{ fontWeight: 700, color: "#1a1a1a" }}>
                        {item.qty}
                      </td>
                      <td className="td">{item.unit}</td>
                      <td className="td">{item.threshold || "—"}</td>
                      <td className="td">₹{(item.cost_per_unit || 0).toLocaleString()}</td>
                      <td className="td" style={{ fontWeight: 700 }}>
                        ₹{totalValue.toLocaleString()}
                      </td>
                      <td className="td">
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            color: statusColor,
                            textTransform: "uppercase",
                          }}
                        >
                          {isLow ? "⚠ Low Stock" : "✓ OK"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pending Procedures */}
      <div className="section">
        <div className="sectionTitle">Pending Procedures</div>

        {procedures.pendingOrders.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#1a1a1a", marginBottom: 10 }}>
              📦 Procurement Orders Awaiting Receipt ({procedures.pendingOrders.length})
            </div>
            <div className="tableWrap">
              <table className="table">
                <thead>
                  <tr>
                    <th className="th">Order ID</th>
                    <th className="th">Material</th>
                    <th className="th">Quantity</th>
                    <th className="th">Supplier</th>
                    <th className="th">Expected Date</th>
                  </tr>
                </thead>
                <tbody>
                  {procedures.pendingOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="td">{order.id}</td>
                      <td className="td">{order.material}</td>
                      <td className="td">
                        {order.quantity} {order.unit}
                      </td>
                      <td className="td">{order.supplier}</td>
                      <td className="td">{order.expectedDate || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {procedures.productionBatches.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#1a1a1a", marginBottom: 10 }}>
              ⚙ Production Batches ({procedures.productionBatches.length})
            </div>
            <div className="tableWrap">
              <table className="table">
                <thead>
                  <tr>
                    <th className="th">Batch ID</th>
                    <th className="th">Product</th>
                    <th className="th">Quantity Produced</th>
                    <th className="th">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {procedures.productionBatches.map((batch) => (
                    <tr key={batch.id}>
                      <td className="td">{batch.id}</td>
                      <td className="td">{batch.product}</td>
                      <td className="td">{batch.quantity} units</td>
                      <td className="td">{batch.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {procedures.salesOrders.length > 0 && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#1a1a1a", marginBottom: 10 }}>
              🛒 Recent Sales Orders ({procedures.salesOrders.length})
            </div>
            <div className="tableWrap">
              <table className="table">
                <thead>
                  <tr>
                    <th className="th">Order ID</th>
                    <th className="th">Product</th>
                    <th className="th">Quantity Sold</th>
                    <th className="th">Total Revenue</th>
                    <th className="th">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {procedures.salesOrders.slice(-10).map((order) => (
                    <tr key={order.id}>
                      <td className="td">{order.id}</td>
                      <td className="td">{order.product}</td>
                      <td className="td">{order.quantity} units</td>
                      <td className="td" style={{ fontWeight: 700, color: "#3a8a5a" }}>
                        ₹{order.totalPrice.toLocaleString()}
                      </td>
                      <td className="td">{order.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {procedures.pendingOrders.length === 0 &&
          procedures.productionBatches.length === 0 &&
          procedures.salesOrders.length === 0 && (
            <div style={{ padding: 20, color: "#999999", textAlign: "center", fontSize: 11 }}>
              No active procedures at this time
            </div>
          )}
      </div>

      {/* Comments */}
      <div className="section">
        <div className="sectionTitle">Inventory Notes</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input
            className="input"
            type="text"
            placeholder="Add a note about inventory..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            style={{ flex: 1 }}
          />
          <button
            className="button"
            onClick={handleAddComment}
            style={{ padding: "8px 16px" }}
          >
            Add Note
          </button>
        </div>

        <div className="commentList">
          {comments.length > 0 ? (
            comments.map((comment, idx) => (
              <div className="comment" key={idx}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, color: "#1a1a1a" }}>{comment.text}</span>
                  <span className="commentTime">{comment.time}</span>
                </div>
              </div>
            ))
          ) : (
            <div style={{ fontSize: 11, color: "#999999", padding: "16px 0" }}>
              No notes yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
