// API Response Types
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: unknown;
}

/**
 * Base API client for making HTTP requests
 */
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || "/api") {
    this.baseUrl = baseUrl;
  }

  /**
   * Make a GET request
   */
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = this.buildUrl(endpoint, params);
    return this.request<T>(url);
  }

  /**
   * Make a POST request
   */
  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.request<T>(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * Make a PUT request
   */
  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.request<T>(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * Make a DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.request<T>(url, {
      method: "DELETE",
    });
  }

  /**
   * Build a URL with query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, string>): string {
    try {
      // For development/testing, if we're using a relative URL, just return the endpoint
      if (this.baseUrl.startsWith("/")) {
        const path = `${this.baseUrl}${endpoint}`;
        return params ? this.addQueryParams(path, params) : path;
      }

      // Otherwise, construct a full URL
      const url = new URL(endpoint, this.baseUrl);

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.append(key, value);
        });
      }

      return url.toString();
    } catch (error) {
      console.error("Error building URL:", error);
      // Fallback to a simple string concatenation
      return `${this.baseUrl}${endpoint}`;
    }
  }

  /**
   * Add query parameters to a path
   */
  private addQueryParams(path: string, params: Record<string, string>): string {
    const queryString = Object.entries(params)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
      )
      .join("&");

    return queryString ? `${path}?${queryString}` : path;
  }

  /**
   * Make an HTTP request and handle errors
   */
  private async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    try {
      // For development/testing, use mock data if available
      if (process.env.NODE_ENV === "development") {
        return this.getMockData<T>(url);
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          JSON.stringify({
            code: errorData.code || "API_ERROR",
            message:
              errorData.message || "An error occurred while fetching data",
            status: response.status,
          })
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        try {
          const parsedError = JSON.parse(error.message) as AppError;
          throw new Error(parsedError.message);
        } catch {
          throw new Error(error.message);
        }
      }

      throw new Error("An unknown error occurred");
    }
  }

  /**
   * Get mock data for development
   */
  private getMockData<T>(url: string): T {
    // Extract the endpoint from the URL
    const endpoint = url.includes("?")
      ? url.substring(url.lastIndexOf("/api") + 4, url.indexOf("?"))
      : url.substring(url.lastIndexOf("/api") + 4);

    // Extract ID from the URL if it's a specific resource
    const idMatch = endpoint.match(/\/(\w+)\/([^\/]+)$/);
    const id = idMatch ? idMatch[2] : null;

    // More comprehensive mock data for development
    const mockData: Record<string, any> = {
      "/projects": [
        {
          id: "1",
          name: "My Startup Project",
          description: "An innovative platform for entrepreneurs",
          lastEdited: new Date().toISOString(),
          completion: 42,
        },
        {
          id: "2",
          name: "New Venture Idea",
          description: "Mobile application for fitness enthusiasts",
          lastEdited: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          completion: 25,
        },
      ],
      "/projects/1": {
        id: "1",
        name: "My Startup Project",
        description: "An innovative platform for entrepreneurs",
        lastEdited: new Date().toISOString(),
        completion: 42,
        canvas: {
          keyPartners: [
            { id: "1", text: "Technology Providers", checked: true },
          ],
          keyActivities: [
            { id: "1", text: "Product Development", checked: true },
            { id: "2", text: "Marketing", checked: false },
          ],
          valuePropositions: [
            { id: "1", text: "All-in-one ideation platform", checked: true },
            { id: "2", text: "Time-saving document generation", checked: true },
            { id: "3", text: "Business validation tools", checked: false },
          ],
          customerSegments: [
            { id: "1", text: "Early-stage founders", checked: true },
            { id: "2", text: "Startup incubators", checked: false },
          ],
          channels: [{ id: "1", text: "SaaS Platform", checked: true }],
          costStructure: [
            { id: "1", text: "Development Costs", checked: true },
          ],
          revenueStreams: [
            { id: "1", text: "Subscription model - $29/mo", checked: true },
            { id: "2", text: "Premium features", checked: false },
          ],
        },
        grpModel: {
          goals: {
            long: [
              {
                id: "1",
                title: "Achieve market leadership",
                description: "Become the most used startup ideation tool",
                status: "in-progress",
              },
            ],
            medium: [
              {
                id: "1",
                title: "1000 paying customers",
                description: "Reach 1000 paying customers by end of year",
                status: "in-progress",
              },
            ],
            short: [
              {
                id: "1",
                title: "MVP Launch",
                description: "Launch MVP with core features",
                status: "completed",
              },
            ],
          },
          risks: {
            market: [
              {
                id: "1",
                title: "Competition",
                description: "Increasing competition in the space",
                impact: "high",
                probability: "medium",
              },
            ],
            technical: [
              {
                id: "1",
                title: "Scalability",
                description: "Ensuring platform scales with user growth",
                impact: "medium",
                probability: "low",
              },
            ],
            financial: [
              {
                id: "1",
                title: "Pricing Model",
                description: "Finding optimal pricing structure",
                impact: "high",
                probability: "medium",
              },
            ],
          },
          problems: {
            customer: [
              {
                id: "1",
                title: "Initial Adoption",
                description: "Getting users to switch from existing tools",
                severity: "medium",
                status: "open",
              },
            ],
            solution: [
              {
                id: "1",
                title: "Feature Complexity",
                description: "Balance between features and simplicity",
                severity: "low",
                status: "in-progress",
              },
            ],
          },
        },
        marketAnalysis: {
          customerInsights: {
            personas: [
              {
                id: "1",
                name: "Tech Startup Founder",
                role: "CEO",
                demographics: "25-35, tech-savvy, entrepreneurial",
                goals: ["Build successful startup", "Secure funding"],
                painPoints: [
                  "Limited time",
                  "Need for organized business planning",
                ],
              },
              {
                id: "2",
                name: "Product Manager",
                role: "PM at startup",
                demographics: "30-40, analytical, strategic thinker",
                goals: [
                  "Streamline product planning",
                  "Validate ideas quickly",
                ],
                painPoints: [
                  "Complex planning tools",
                  "Difficult collaboration",
                ],
              },
            ],
          },
          competitors: [
            {
              id: "1",
              name: "CompetitorX",
              type: "Direct",
              strengths: ["Established brand", "Large user base"],
              weaknesses: ["Outdated interface", "Limited export options"],
              marketShare: 30,
            },
            {
              id: "2",
              name: "AlternativeSolution",
              type: "Indirect",
              strengths: ["Free tier", "Simple UI"],
              weaknesses: ["Limited features", "No document generation"],
              marketShare: 15,
            },
          ],
          marketSize: {
            tam: "2B",
            sam: "500M",
            som: "50M",
          },
        },
        userFlow: {
          features: [
            {
              id: "1",
              name: "Business Model Canvas",
              description: "Interactive canvas for business model planning",
              priority: "high",
              status: "completed",
            },
            {
              id: "2",
              name: "Document Generation",
              description:
                "Automated creation of business plans and pitch decks",
              priority: "medium",
              status: "in-progress",
            },
            {
              id: "3",
              name: "Market Analysis Tools",
              description:
                "Tools for analyzing market conditions and competitors",
              priority: "high",
              status: "planned",
            },
          ],
          userStories: [
            {
              id: "1",
              title: "Canvas Editing",
              description:
                "As a user, I want to edit my business canvas easily",
              acceptance: ["Drag and drop interface", "Real-time saving"],
              status: "completed",
            },
          ],
        },
        documents: [
          {
            id: "1",
            name: "Business Plan",
            type: "pdf",
            created: new Date(Date.now() - 86400000).toISOString(),
            status: "generated",
          },
        ],
      },
      "/projects/2": {
        id: "2",
        name: "New Venture Idea",
        description: "Mobile application for fitness enthusiasts",
        lastEdited: new Date(Date.now() - 86400000).toISOString(),
        completion: 25,
        canvas: {
          keyPartners: [],
          keyActivities: [],
          valuePropositions: [
            { id: "1", text: "Personalized fitness tracking", checked: true },
          ],
          customerSegments: [
            { id: "1", text: "Fitness enthusiasts", checked: true },
          ],
          channels: [],
          costStructure: [],
          revenueStreams: [{ id: "1", text: "Freemium model", checked: true }],
        },
        documents: [],
      },
    };

    // Ensure all document dates are valid
    if (mockData["/projects/1"]?.documents) {
      mockData["/projects/1"].documents.forEach((doc: any) => {
        if (doc.created) {
          // Make sure the date is valid
          try {
            const date = new Date(doc.created);
            if (isNaN(date.getTime())) {
              doc.created = new Date().toISOString();
            }
          } catch (e) {
            doc.created = new Date().toISOString();
          }
        }
      });
    }

    // Try to get the specific project data by ID if applicable
    if (id && endpoint.startsWith("/projects/")) {
      return (mockData[`/projects/${id}`] || {}) as T;
    }

    // Return the mock data for the endpoint or an empty object
    return (mockData[endpoint] || {}) as T;
  }
}

// Create a singleton instance
export const apiClient = new ApiClient();
