 <div className="grid grid-cols-2 gap-3">
          {historyData?.length > 0 ? (
            historyData?.map((item) => (
              <div
                key={item?._id}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm  transition-shadow hover:shadow-2xl"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex flex-col">
                    <span className="inline-block px-2 py-1 text-lg font-semibold text-blue-600 bg-blue-50 rounded-md w-fit capitalize">
                      {item?.updateType}
                    </span>

                    <div
                      className={`text-lg text-blue-600 mt-1 flex flex-col font-semibold ${
                        !item?.meetingAt ? "hidden" : ""
                      }`}
                    >
                      <span>Meeting Date</span>
                      {new Date(item?.meetingAt).toLocaleString()}
                    </div>
                  </div>
                  <span className="text-lg font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded capitalize">
                    {item.status}
                  </span>
                </div>
                <p className="text-lg text-gray-700 mb-4 whitespace-pre-wrap">
                  {item.note}
                </p>
                <div className="flex justify-between items-end border-t pt-3">
                  <div className="text-lg text-gray-500">
                    <p className="font-medium text-gray-900">
                      {item.salesPersonId?.username}
                    </p>
                    <p>{item.salesPersonId?.email}</p>
                  </div>
                  {item.reminderAt && (
                    <div className="text-lg text-right">
                      <p className="text-gray-400">Reminder</p>
                      <p className="font-medium text-orange-600">
                        {new Date(item.reminderAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div>No history available</div>
          )}
        </div>