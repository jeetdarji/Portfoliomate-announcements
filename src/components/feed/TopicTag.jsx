export function TopicTag({ label }) {
  if (!label) return null;
  
  return (
    <div className="inline-flex items-center rounded-full bg-[#F3F2FF] py-1 px-[10px] mt-2">
      <span className="font-display font-semibold text-[12px] leading-[16px] text-[#010080]">
        {label}
      </span>
    </div>
  );
}

export default TopicTag;