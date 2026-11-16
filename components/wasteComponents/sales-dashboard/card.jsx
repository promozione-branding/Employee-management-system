// components/wasteComponents/sales-dashboard/card.jsx

<div
    key={item._id}
    className="flex flex-col gap-3 rounded-2xl border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
>
    {/* Header Section */}
    <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
            <div className={`rounded-xl border-2 border-black p-2.5 ${item.updateType === 'meeting' ? 'bg-purple-300 text-black' : 'bg-blue-300 text-black'}`}>
                {item.updateType === 'meeting' ? <Users size={20} strokeWidth={2.5} /> : <Phone size={20} strokeWidth={2.5} />}
            </div>
            <div>
                <h3 className="text-base leading-tight font-bold text-black">{item.client?.name || 'Unknown Client'}</h3>
                <p className="text-xs font-bold text-gray-500">{item.client?.company || 'No Company'}</p>
            </div>
        </div>
        <span className="rounded border-2 border-gray-200 px-1.5 py-0.5 text-[10px] font-bold text-gray-400">{formatDate(item.createdAt).split(',')[0]}</span>
    </div>

    {/* Status Badge */}
    <div className="flex items-center gap-2">
        <span
            className={`rounded-full border-2 border-black px-3 py-1 text-[10px] font-bold tracking-wide uppercase ${
                item.status === 'talk' || item.status === 'interested'
                    ? 'bg-green-300 text-black'
                    : item.status === 'not-interested' || item.status === 'no-talk'
                      ? 'bg-red-300 text-black'
                      : 'bg-gray-200 text-black'
            }`}
        >
            {item.status || 'No Status'}
        </span>
        <span className="ml-auto text-[10px] font-bold text-gray-400">{formatDate(item.createdAt).split(',')[1]}</span>
    </div>

    {/* Note Section */}
    {item.note && (
        <div className="relative mt-1 rounded-xl border-2 border-black bg-yellow-50 p-3">
            <div className="absolute -top-2 left-3 rounded border-2 border-black bg-white px-1.5 text-[9px] font-bold uppercase">Note</div>
            <p className="mt-1 text-sm leading-relaxed font-medium text-gray-800">{item.note}</p>
        </div>
    )}

    {/* Footer: Meeting/Reminder Details */}
    <div className="mt-auto space-y-2">
        {item.meetingAt && (
            <div className="flex items-center gap-2 rounded-lg border-2 border-black bg-purple-100 px-3 py-2 text-xs font-bold text-black">
                <Calendar size={16} strokeWidth={2.5} />
                <span>Meeting: {formatDate(item.meetingAt)}</span>
            </div>
        )}
        {item.reminderAt && (
            <div className="relative flex items-center gap-2 overflow-hidden rounded-lg border-2 border-black bg-amber-100 px-3 py-2 text-xs font-bold text-black">
                <Clock size={16} strokeWidth={2.5} />
                <span className="z-10">Reminder: {formatDate(item.reminderAt)}</span>
                {item.reminderSent && (
                    <div className="absolute top-0 right-0 bottom-0 flex items-center border-l-2 border-black bg-amber-300 px-2 text-[9px] font-extrabold">
                        SENT
                    </div>
                )}
            </div>
        )}
    </div>
</div>;
