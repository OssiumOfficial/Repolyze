import { forwardRef, useCallback } from "react";
import { Tweet } from "./types";
import Avatar from "./avatar";
import VerifiedBadge from "./verified-badge";

interface TweetCardProps {
  tweet: Tweet;
}

const TweetCard = forwardRef<HTMLDivElement, TweetCardProps>(
  ({ tweet }, ref) => {
    const handleUsernameClick = useCallback(
      (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.stopPropagation();
      },
      []
    );

    const twitterProfileUrl = `https://twitter.com/${tweet.user.username}`;

    return (
      <div
        ref={ref}
        className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 flex flex-col gap-2 sm:gap-3 h-full overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Avatar src={tweet.user.avatar} name={tweet.user.name} isOrg={tweet.user.isOrg} />
          <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
            <div className="flex items-center gap-1 min-w-0">
              <span className="text-xs sm:text-sm font-semibold text-foreground truncate">
                {tweet.user.name}
              </span>
              {tweet.user.isVerified && (
                <VerifiedBadge
                  size={14}
                  className="sm:w-4 sm:h-4"
                  tone={tweet.user.isOrg ? "org" : "default"}
                />
              )}
            </div>
            <a
              href={twitterProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleUsernameClick}
              className="text-[10px] sm:text-xs text-muted-foreground truncate hover:underline transition-colors cursor-pointer max-w-full"
            >
              @{tweet.user.username}
            </a>
          </div>
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground shrink-0"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </div>

        {/* Content */}
        <p className="text-xs sm:text-sm text-foreground leading-relaxed wrap-break-word overflow-hidden">
          {tweet.content}
        </p>
      </div>
    );
  }
);

TweetCard.displayName = "TweetCard";

export default TweetCard;
