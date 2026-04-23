import { formatDistanceToNow } from 'date-fns';
import { Avatar } from '../ui/Avatar';

export function PostAuthorHeader({ name, role, avatarUrl, timestamp, className = '' }) {
  const timeFormatted = timestamp 
    ? formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    : '';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Avatar size="xl" src={avatarUrl} name={name} />
      <div className="flex flex-col gap-0.5">
        <span className="font-display font-semibold text-[14px] leading-[20px] text-[#0F172B]">
          {name}
        </span>
        <div className="flex items-center gap-1 font-display font-normal text-[12px] leading-[16px] text-[#62748E]">
          <span>{role}</span>
          <span aria-hidden="true">•</span>
          {timestamp && (
            <time dateTime={timestamp}>
              {timeFormatted}
            </time>
          )}
        </div>
      </div>
    </div>
  );
}

export default PostAuthorHeader;