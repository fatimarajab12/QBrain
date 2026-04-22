import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { User } from "@/types/user";
import { getInitials } from "@/utils/user-helpers";

interface UserAvatarCardProps {
  user: User;
  onUserUpdate: (user: User) => void;
}

const UserAvatarCard = ({ user }: UserAvatarCardProps) => {
  return (
    <Card className="shadow-soft border-border">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <Avatar className="h-24 w-24 border-2 border-border">
            <AvatarFallback className="text-2xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
              {getInitials(user)}
            </AvatarFallback>
          </Avatar>
          
          <div className="space-y-1">
            <h3 className="font-bold text-lg">{user.name}</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          
          <Badge className={`${user.isVerified ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'}`}>
            {user.isVerified ? "Verified" : "Not Verified"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserAvatarCard;
