 <div
          key={item._id}
          className="bg-white border-2 border-black rounded-2xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all duration-200 flex flex-col gap-3"
        >
          {/* Header Section */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl border-2 border-black ${
                  item.updateType === "meeting"
                    ? "bg-purple-300 text-black"
                    : "bg-blue-300 text-black"
                }`}
              >
                {item.updateType === "meeting" ? (
                  <Users size={20} strokeWidth={2.5} />
                ) : (
                  <Phone size={20} strokeWidth={2.5} />
                )}
              </div>
              <div>
                <h3 className="font-bold text-black text-base leading-tight">
                  {item.client?.name || "Unknown Client"}
                </h3>
                <p className="text-xs font-bold text-gray-500">
                  {item.client?.company || "No Company"}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-gray-400 border-2 border-gray-200 rounded px-1.5 py-0.5">
              {formatDate(item.createdAt).split(",")[0]}
            </span>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] px-3 py-1 rounded-full font-bold border-2 border-black uppercase tracking-wide ${
                item.status === "talk" || item.status === "interested"
                  ? "bg-green-300 text-black"
                  : item.status === "not-interested" ||
                    item.status === "no-talk"
                  ? "bg-red-300 text-black"
                  : "bg-gray-200 text-black"
              }`}
            >
              {item.status || "No Status"}
            </span>
            <span className="text-[10px] font-bold text-gray-400 ml-auto">
              {formatDate(item.createdAt).split(",")[1]}
            </span>
          </div>

          {/* Note Section */}
          {item.note && (
            <div className="bg-yellow-50 border-2 border-black rounded-xl p-3 relative mt-1">
              <div className="absolute -top-2 left-3 bg-white border-2 border-black px-1.5 rounded text-[9px] font-bold uppercase">
                Note
              </div>
              <p className="text-sm font-medium text-gray-800 leading-relaxed mt-1">
                {item.note}
              </p>
            </div>
          )}

          {/* Footer: Meeting/Reminder Details */}
          <div className="mt-auto space-y-2">
            {item.meetingAt && (
              <div className="flex items-center gap-2 text-xs font-bold text-black bg-purple-100 px-3 py-2 rounded-lg border-2 border-black">
                <Calendar size={16} strokeWidth={2.5} />
                <span>Meeting: {formatDate(item.meetingAt)}</span>
              </div>
            )}
            {item.reminderAt && (
              <div className="flex items-center gap-2 text-xs font-bold text-black bg-amber-100 px-3 py-2 rounded-lg border-2 border-black relative overflow-hidden">
                <Clock size={16} strokeWidth={2.5} />
                <span className="z-10">
                  Reminder: {formatDate(item.reminderAt)}
                </span>
                {item.reminderSent && (
                  <div className="absolute right-0 top-0 bottom-0 bg-amber-300 px-2 flex items-center border-l-2 border-black font-extrabold text-[9px]">
                    SENT
                  </div>
                )}
              </div>
            )}
          </div>
        </div>