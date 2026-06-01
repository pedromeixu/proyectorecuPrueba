import axios from "axios";

const API = "http://localhost:3000/facturas";

export async function getFacturas() {
  const res = await axios.get(API);
  return res.data;
}

export async function addFactura(factura) {
  const res = await axios.post(API, factura);
  return res.data;
}

export async function deleteFactura(id) {
  await axios.delete(`${API}/${id}`);
}
