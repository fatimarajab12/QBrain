// pages/profile/components/AccountInfoCard.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Briefcase, Calendar } from "lucide-react";
import { User as UserType } from "@/types/user";
import { formatJoinDate } from "@/utils/user-helpers";

interface AccountInfoCardProps {
  user: UserType;
}

const AccountInfoCard = ({ user }: AccountInfoCardProps) => {
  const infoItems = [
    {
      icon: User,
      label: "Full Name",
      value: user.name,
    },
    {
      icon: Mail,
      label: "Email Address",
      value: user.email,
    },
    {
      icon: Briefcase,
      label: "Department",
      value: user.department,
    },
    {
      icon: Calendar,
      label: "Member Since",
      value: formatJoinDate(user.joinDate),
    },
  ];

  return (
    <Card className="shadow-soft border-border">
      <CardHeader>
        <CardTitle>Account Information</CardTitle>
        <CardDescription>Your basic account details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {infoItems.map((item, index) => (
          <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <item.icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="font-medium truncate">{item.value}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default AccountInfoCard;