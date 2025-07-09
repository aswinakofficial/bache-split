import { useEffect, useState } from "react";
import api from "../../services/api";

export default function ItemList({ houseId }) {
  const [items, setItems] = useState([]);
  useEffect(() => {
    api.get(`/items/?house=${houseId}`).then((res) => setItems(res.data));
  }, [houseId]);
  return (
    <div>
      {items.map((item) => (
        <div key={item.id}>
          <b>{item.name}</b> - {item.remaining_quantity} {item.unit} @ ₹
          {item.unit_price}
        </div>
      ))}
    </div>
  );
}
