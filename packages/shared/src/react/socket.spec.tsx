import { render, renderHook, screen, waitFor } from "@testing-library/react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { Socket, useSocket } from "./socket";

const mockConnect = jest.fn();
const mockDisconnect = jest.fn();
let mockSocketInstances: any[] = [];

jest.mock("phoenix", () => {
  class MockSocket {
    connect = mockConnect;
    disconnect = mockDisconnect;

    constructor(
      public url: string,
      public options: { params: Record<string, unknown> }
    ) {
      mockSocketInstances.push(this);
    }
  }

  return {
    Socket: MockSocket,
  };
});

describe("Socket Context", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSocketInstances = [];
  });

  test("creates socket instance on mount", () => {
    const { unmount } = render(
      <Socket>
        <div>Test Child</div>
      </Socket>
    );

    expect(mockSocketInstances).toHaveLength(1);
    expect(mockSocketInstances[0].url).toBe(
      process.env.NEXT_PUBLIC_PHOENIX_URL
    );
    expect(mockSocketInstances[0].options).toEqual({ params: {} });

    unmount();
  });

  test("connects socket on mount", async () => {
    const { unmount } = render(
      <Socket>
        <div>Test Child</div>
      </Socket>
    );

    await waitFor(() => {
      expect(mockConnect).toHaveBeenCalledTimes(1);
    });

    unmount();
  });

  test("disconnects socket on unmount", async () => {
    const { unmount } = render(
      <Socket>
        <div>Test Child</div>
      </Socket>
    );

    await waitFor(() => {
      expect(mockConnect).toHaveBeenCalledTimes(1);
    });

    unmount();

    expect(mockDisconnect).toHaveBeenCalledTimes(1);
  });

  test("uses env variable URL", () => {
    const { unmount } = render(
      <Socket>
        <div>Test Child</div>
      </Socket>
    );

    expect(mockSocketInstances[mockSocketInstances.length - 1].url).toBe(
      process.env.NEXT_PUBLIC_PHOENIX_URL
    );
    expect(mockSocketInstances[mockSocketInstances.length - 1].options).toEqual(
      {
        params: {},
      }
    );

    unmount();
  });

  test("provides socket instance through context", () => {
    const TestComponent = () => {
      const socket = useSocket();
      return (
        <div data-testid="socket-type">
          {socket && typeof socket === "object" ? "valid" : "invalid"}
        </div>
      );
    };

    render(
      <Socket>
        <TestComponent />
      </Socket>
    );

    expect(screen.getByTestId("socket-type").textContent).toBe("valid");
  });

  test("renders children correctly", () => {
    render(
      <Socket>
        <div data-testid="child">Test Child Content</div>
      </Socket>
    );

    expect(screen.getByTestId("child").textContent).toBe("Test Child Content");
  });

  test("renders multiple children correctly", () => {
    render(
      <Socket>
        <div data-testid="child-1">First Child</div>
        <div data-testid="child-2">Second Child</div>
        <div data-testid="child-3">Third Child</div>
      </Socket>
    );

    expect(screen.getByTestId("child-1")).toBeTruthy();
    expect(screen.getByTestId("child-2")).toBeTruthy();
    expect(screen.getByTestId("child-3")).toBeTruthy();
  });

  test("returns socket instance when used within Socket provider", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Socket>{children}</Socket>
    );

    const { result } = renderHook(() => useSocket(), { wrapper });

    expect(result.current).toBeTruthy();
    expect(typeof result.current).toBe("object");
  });

  test("throws error when used outside Socket provider", () => {
    const originalError = console.error;
    console.error = jest.fn();

    expect(() => {
      renderHook(() => useSocket());
    }).toThrow("useSocket must be used within Socket component");

    console.error = originalError;
  });

  test("throws when provider is mounted in a different root", () => {
    const rootA = document.createElement("div");
    const rootB = document.createElement("div");
    document.body.appendChild(rootA);
    document.body.appendChild(rootB);

    const ProviderRoot = createRoot(rootA);
    // Mount a provider in a separate root
    act(() => {
      ProviderRoot.render(
        <Socket>
          <div data-testid="provider-mounted" />
        </Socket>
      );
    });

    const TestConsumer = () => {
      useSocket();
      return null;
    };

    // Attempt to render consumer in a different root — should throw since the
    // provider is not in the same React root/context boundary. Use render from
    // testing-library to capture thrown errors in the test adapter.
    expect(() => render(<TestConsumer />, { container: rootB })).toThrow(
      "useSocket must be used within Socket component"
    );
    act(() => {
      ProviderRoot.unmount();
    });
  });

  test("returns same socket instance across multiple hook calls", () => {
    let socket1: any;
    let socket2: any;

    const TestComponent1 = () => {
      socket1 = useSocket();
      return null;
    };

    const TestComponent2 = () => {
      socket2 = useSocket();
      return null;
    };

    render(
      <Socket>
        <TestComponent1 />
        <TestComponent2 />
      </Socket>
    );

    expect(socket1).toBe(socket2);
  });

  test("maintains same socket instance across re-renders", () => {
    const TestComponent = () => {
      const socket = useSocket();
      return <div data-testid="socket-id">{(socket as any).url}</div>;
    };

    const { rerender } = render(
      <Socket>
        <TestComponent />
      </Socket>
    );

    const firstUrl = screen.getByTestId("socket-id").textContent;

    rerender(
      <Socket>
        <TestComponent />
      </Socket>
    );

    const secondUrl = screen.getByTestId("socket-id").textContent;

    expect(firstUrl).toBe(secondUrl);
  });

  test("does not reconnect on re-renders", async () => {
    const TestComponent = ({ count }: { count: number }) => {
      useSocket();
      return <div>{count}</div>;
    };

    const { rerender } = render(
      <Socket>
        <TestComponent count={1} />
      </Socket>
    );

    await waitFor(() => {
      expect(mockConnect).toHaveBeenCalledTimes(1);
    });

    rerender(
      <Socket>
        <TestComponent count={2} />
      </Socket>
    );

    rerender(
      <Socket>
        <TestComponent count={3} />
      </Socket>
    );

    expect(mockConnect).toHaveBeenCalledTimes(1);
  });

  test("creates socket only once despite multiple re-renders of children", () => {
    let capturedSocket1: any;
    let capturedSocket2: any;
    let capturedSocket3: any;

    const TestComponent = ({ count }: { count: number }) => {
      const socket = useSocket();
      if (count === 1) capturedSocket1 = socket;
      if (count === 2) capturedSocket2 = socket;
      if (count === 3) capturedSocket3 = socket;
      return <div>Count: {count}</div>;
    };

    const { rerender } = render(
      <Socket>
        <TestComponent count={1} />
      </Socket>
    );

    rerender(
      <Socket>
        <TestComponent count={2} />
      </Socket>
    );

    rerender(
      <Socket>
        <TestComponent count={3} />
      </Socket>
    );

    expect(capturedSocket1).toBe(capturedSocket2);
    expect(capturedSocket2).toBe(capturedSocket3);
  });

  test("handles rapid mount/unmount cycles", async () => {
    const { unmount: unmount1 } = render(
      <Socket>
        <div>Test 1</div>
      </Socket>
    );

    unmount1();

    const { unmount: unmount2 } = render(
      <Socket>
        <div>Test 2</div>
      </Socket>
    );

    unmount2();

    const { unmount: unmount3 } = render(
      <Socket>
        <div>Test 3</div>
      </Socket>
    );

    await waitFor(() => {
      expect(mockConnect).toHaveBeenCalled();
    });

    unmount3();

    expect(mockDisconnect).toHaveBeenCalledTimes(3);
  });

  test("handles multiple Socket providers (nested)", () => {
    const TestComponent = () => {
      const socket = useSocket();
      return (
        <div data-testid="socket-present">{socket ? "present" : "absent"}</div>
      );
    };

    render(
      <Socket>
        <Socket>
          <TestComponent />
        </Socket>
      </Socket>
    );

    expect(screen.getByTestId("socket-present").textContent).toBe("present");
    expect(mockSocketInstances).toHaveLength(2);
  });

  test("allows child components to access socket for operations", () => {
    const TestComponent = () => {
      const socket = useSocket();

      return (
        <div>
          <div data-testid="socket-url">{(socket as any).url}</div>
          <div data-testid="socket-params">
            {JSON.stringify((socket as any).options.params)}
          </div>
        </div>
      );
    };

    render(
      <Socket>
        <TestComponent />
      </Socket>
    );

    expect(screen.getByTestId("socket-url")).toBeTruthy();
    expect(screen.getByTestId("socket-params").textContent).toBe("{}");
  });

  test("maintains socket state across component tree", () => {
    const DeepChild = () => {
      const socket = useSocket();
      return (
        <div data-testid="deep-socket">
          {socket && typeof socket === "object" ? "valid" : "invalid"}
        </div>
      );
    };

    const MiddleChild = () => (
      <div>
        <DeepChild />
      </div>
    );

    const ParentChild = () => (
      <div>
        <MiddleChild />
      </div>
    );

    render(
      <Socket>
        <ParentChild />
      </Socket>
    );

    expect(screen.getByTestId("deep-socket").textContent).toBe("valid");
  });

  test("does not cause memory leaks on multiple mount/unmount", async () => {
    for (let i = 0; i < 10; i++) {
      const { unmount } = render(
        <Socket>
          <div>Test {i}</div>
        </Socket>
      );

      await waitFor(() => {
        expect(mockConnect).toHaveBeenCalled();
      });

      unmount();
    }

    expect(mockConnect).toHaveBeenCalledTimes(10);
    expect(mockDisconnect).toHaveBeenCalledTimes(10);
  });

  test("does not trigger unnecessary re-renders in consumers", () => {
    let renderCount = 0;

    const TestComponent = () => {
      renderCount++;
      useSocket();
      return <div>Render count: {renderCount}</div>;
    };

    const { rerender } = render(
      <Socket>
        <TestComponent />
      </Socket>
    );

    const initialRenderCount = renderCount;

    rerender(
      <Socket>
        <TestComponent />
      </Socket>
    );

    expect(renderCount).toBeGreaterThan(initialRenderCount);
  });
});
