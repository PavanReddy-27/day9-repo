// ====================================
// File: src/services/organizationApi.ts
// ====================================

class OrganizationApi {
  private get ApiBase() {
    return (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_BASE_URL || "/api/v1";
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("accessToken");
    if (!token) return { "Content-Type": "application/json" };
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  async getLocations(): Promise<any[]> {
    try {
      const res = await fetch(`${this.ApiBase}/locations`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });
      if (!res.ok) {
        throw new Error("Failed to fetch locations");
      }
      const json = await res.json();
      return json.data || [];
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  async getDepartments(locationId?: string): Promise<any[]> {
    try {
      const url = new URL(`${window.location.origin}${this.ApiBase}/departments`);
      if (locationId) {
        url.searchParams.append("locationId", locationId);
      }
      const res = await fetch(url.toString(), {
        method: "GET",
        headers: this.getAuthHeaders(),
      });
      if (!res.ok) {
        throw new Error("Failed to fetch departments");
      }
      const json = await res.json();
      return json.data || [];
    } catch (err) {
      console.warn("Backend offline. Returning mock departments to preview UI.");
      return [
        { _id: "1", name: "Engineering", code: "ENG", locationId: { name: "Hyderabad", code: "HYD" } },
        { _id: "2", name: "Human Resources", code: "HR", locationId: { name: "Visakhapatnam", code: "VSP" } },
        { _id: "3", name: "Finance", code: "FIN", locationId: { name: "Chennai", code: "CHN" } },
        { _id: "4", name: "Sales", code: "SAL", locationId: { name: "Bengaluru", code: "BLR" } },
        { _id: "5", name: "Marketing", code: "MKT", locationId: { name: "Kochi", code: "KOC" } }
      ];
    }
  }

  async getTeams(departmentId?: string): Promise<any[]> {
    try {
      const url = new URL(`${window.location.origin}${this.ApiBase}/teams`);
      if (departmentId) {
        url.searchParams.append("departmentId", departmentId);
      }
      const res = await fetch(url.toString(), {
        method: "GET",
        headers: this.getAuthHeaders(),
      });
      if (!res.ok) {
        throw new Error("Failed to fetch teams");
      }
      const json = await res.json();
      return json.data || [];
    } catch (err) {
      console.error(err);
      return [];
    }
  }
}

const organizationApi = new OrganizationApi();
export default organizationApi;
