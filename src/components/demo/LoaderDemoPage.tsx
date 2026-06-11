import {
  AuthLoader,
  AuthButtonLoader,
  AuthOverlayLoader,
} from "@/components/common/AuthLoader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";

export function LoaderDemoPage() {
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayType, setOverlayType] = useState<
    "login" | "register" | "oauth"
  >("login");
  const [overlayProvider, setOverlayProvider] = useState<
    "google" | "github" | undefined
  >();

  const showOverlayDemo = (
    type: "login" | "register" | "oauth",
    provider?: "google" | "github"
  ) => {
    setOverlayType(type);
    setOverlayProvider(provider);
    setShowOverlay(true);
  };

  return (
    <>
      {showOverlay && (
        <AuthOverlayLoader
          type={overlayType}
          provider={overlayProvider}
          onComplete={() => setShowOverlay(false)}
        />
      )}

      <div className="container mx-auto py-8 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">
            Authentication Loaders Demo
          </h1>
          <p className="text-muted-foreground">
            Creative and meaningful loading states for crypto platform
            authentication
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Login Loader */}
          <Card>
            <CardHeader>
              <CardTitle>Login Loader</CardTitle>
              <CardDescription>
                Multi-step login authentication process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AuthLoader type="login" />
              <Button
                className="w-full mt-4"
                onClick={() => showOverlayDemo("login")}
              >
                Show Overlay Demo
              </Button>
            </CardContent>
          </Card>

          {/* Register Loader */}
          <Card>
            <CardHeader>
              <CardTitle>Register Loader</CardTitle>
              <CardDescription>
                Account creation with security setup
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AuthLoader type="register" />
              <Button
                className="w-full mt-4"
                onClick={() => showOverlayDemo("register")}
              >
                Show Overlay Demo
              </Button>
            </CardContent>
          </Card>

          {/* Google OAuth Loader */}
          <Card>
            <CardHeader>
              <CardTitle>Google OAuth</CardTitle>
              <CardDescription>Google authentication flow</CardDescription>
            </CardHeader>
            <CardContent>
              <AuthLoader type="oauth" provider="google" />
              <Button
                className="w-full mt-4"
                onClick={() => showOverlayDemo("oauth", "google")}
              >
                Show Overlay Demo
              </Button>
            </CardContent>
          </Card>

          {/* GitHub OAuth Loader */}
          <Card>
            <CardHeader>
              <CardTitle>GitHub OAuth</CardTitle>
              <CardDescription>GitHub authentication flow</CardDescription>
            </CardHeader>
            <CardContent>
              <AuthLoader type="oauth" provider="github" />
              <Button
                className="w-full mt-4"
                onClick={() => showOverlayDemo("oauth", "github")}
              >
                Show Overlay Demo
              </Button>
            </CardContent>
          </Card>

          {/* Button Loaders */}
          <Card>
            <CardHeader>
              <CardTitle>Button Loaders</CardTitle>
              <CardDescription>Inline button loading states</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" disabled>
                <AuthButtonLoader text="Signing in..." />
              </Button>
              <Button className="w-full" disabled>
                <AuthButtonLoader text="Creating Account..." />
              </Button>
              <Button className="w-full" disabled>
                <AuthButtonLoader text="Connecting to Google..." />
              </Button>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
              <CardDescription>
                What makes these loaders special
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>🔒 Security-focused messaging</li>
                <li>📱 Crypto-themed animations</li>
                <li>⚡ Multi-step progress indicators</li>
                <li>🎨 Provider-specific styling</li>
                <li>🔄 Smooth transitions</li>
                <li>📊 Portfolio initialization hints</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
