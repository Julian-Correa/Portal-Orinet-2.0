const PORTAL_API_BASE = import.meta.env.VITE_PORTAL_API_BASE || "";

function getHeaders(adminCode) {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Admin-Code": adminCode,
  };
}

async function handleResponse(response) {
  let data = null;
  try {
    data = await response.json();
  } catch (e) {
    // ignore
  }

  if (!response.ok) {
    throw new Error(data?.error || `Error ${response.status}`);
  }
  return data;
}

export const adminApi = {
  async getMetrics(adminCode) {
    const res = await fetch(`${PORTAL_API_BASE}/admin/metrics`, {
      headers: getHeaders(adminCode),
    });
    return handleResponse(res);
  },

  async getCostos(adminCode) {
    const res = await fetch(`${PORTAL_API_BASE}/admin/config/costos`, {
      headers: getHeaders(adminCode),
    });
    return handleResponse(res);
  },

  async updateCostos(adminCode, costos) {
    const res = await fetch(`${PORTAL_API_BASE}/admin/config/costos`, {
      method: "PUT",
      headers: getHeaders(adminCode),
      body: JSON.stringify(costos),
    });
    return handleResponse(res);
  },

  async getPopup(adminCode) {
    const res = await fetch(`${PORTAL_API_BASE}/admin/config/popup`, {
      headers: getHeaders(adminCode),
    });
    return handleResponse(res);
  },

  async updatePopup(adminCode, popup) {
    const res = await fetch(`${PORTAL_API_BASE}/admin/config/popup`, {
      method: "PUT",
      headers: getHeaders(adminCode),
      body: JSON.stringify(popup),
    });
    return handleResponse(res);
  },

  async getPlanes(adminCode) {
    const res = await fetch(`${PORTAL_API_BASE}/admin/config/planes`, {
      headers: getHeaders(adminCode),
    });
    return handleResponse(res);
  },

  async updatePlanes(adminCode, planes) {
    const res = await fetch(`${PORTAL_API_BASE}/admin/config/planes`, {
      method: "PUT",
      headers: getHeaders(adminCode),
      body: JSON.stringify(planes),
    });
    return handleResponse(res);
  }
};
