// components/features/ProductCard.tsx
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/Card";
import { Text } from "../ui/Text";
import { Title } from "../ui/Title";
import { Button } from "../ui/Button";
import { cn } from "@/lib/utils";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";

interface ProductCardProps {
  title: string;
  description: string;
  href?: string;
  onAction?: () => void;
  actionLabel?: string;
  className?: string;
}

export default function ProductCard({
  title,
  description,
  href,
  onAction,
  actionLabel = "Ver producto",
  className,
}: ProductCardProps) {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
        {/*<CardAction>
          <Button href={"/signup"}>Sign Up</Button>
        </CardAction>*/}
      </CardHeader>
      <CardContent>
        <form>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Button
                  href="#"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </Button>
              </div>
              <Input id="password" type="password" required />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button type="submit" className="w-full">
          Login
        </Button>
        <Button className="w-full" variant="outline">
          Login with Google
        </Button>
      </CardFooter>
    </Card>
  );
}
