import { Router as WouterRouter, Route, Switch } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import WhitelistPage from "@/pages/whitelist";
import MarketplacePage from "@/pages/marketplace";
import AuthCallback from "@/pages/auth/callback";

function App() {
  return (
    <div className="dark">
      <TooltipProvider>
        <WouterRouter>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/whitelist" component={WhitelistPage} />
            <Route path="/marketplace" component={MarketplacePage} />
            <Route path="/auth/callback" component={AuthCallback} />
            <Route>
              <div
                style={{
                  background: "#08090a",
                  width: "100vw",
                  height: "100vh",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: "2rem",
                  color: "#D4F95C",
                }}
              >
                404 — NOT FOUND
              </div>
            </Route>
          </Switch>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </div>
  );
}

export default App;
