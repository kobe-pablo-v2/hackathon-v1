import { TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { Dayjs } from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { StatusCodes } from "http-status-codes";
import { useEffect, useState } from "react";
import { IconContext } from "react-icons";
import { BsTrash3 } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { client } from "../../api/clinent";
import { components } from "../../api/v1";
import { appURL } from "../../config/url";
import LoadingSpinner from "../../ui/spiner";

dayjs.extend(utc);
dayjs.extend(timezone);

type User = {
  id: number;
  label: string;
};

type ConfirmedShift = {
  id: number;
  start: string;
  end: string;
};

type ConfirmedProps = {
  users: User[];
  confirms: ConfirmedShift[];
  setConfirmedShift: React.Dispatch<React.SetStateAction<ConfirmedShift[]>>;
  confirmedShift: ConfirmedShift[];
  focusDay: dayjs.Dayjs;
};

type RequestProps = {
  users: User[];
  shiftRequests:
    | components["schemas"]["ShiftInMonthResponseSchema"]
    | undefined;
};

export const Shift = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedYearAndMonth, setSelectedYearAndMonth] = useState<Dayjs>(
    dayjs(new Date().toISOString().substring(0, 10)),
  );

  const [shiftRequests, setShiftRequests] =
    useState<components["schemas"]["ShiftInMonthResponseSchema"]>();
  const [confirmedShift, setConfirmedShift] = useState<ConfirmedShift[]>([]);

  const navigate = useNavigate();

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    (async () => {
      const userRes = client.GET("/api/employer/user");
      const shiftRequestRes = client.GET("/api/employer/shiftRequest", {
        params: {
          query: {
            year: selectedYearAndMonth.year().toString(),
            month: (selectedYearAndMonth.month() + 1)
              .toString()
              .padStart(2, "0"),
          },
        },
      });
      const confirmedShiftRes = client.GET("/api/user/confirmedShift", {
        params: {
          query: {
            year: selectedYearAndMonth.year().toString(),
            month: (selectedYearAndMonth.month() + 1)
              .toString()
              .padStart(2, "0"),
          },
        },
      });

      {
        const { data, response } = await userRes;
        if (response.status === StatusCodes.UNAUTHORIZED) {
          navigate(appURL.login);
        }
        if (data) {
          setUsers(
            data.map((user) => {
              return { id: user.id, label: user.name };
            }),
          );
        }
      }

      {
        const { data, response } = await shiftRequestRes;
        if (response.status === StatusCodes.UNAUTHORIZED) {
          navigate(appURL.login);
        }
        if (data) {
          for (const userShiftRequest of data) {
            userShiftRequest.shiftTime.sort(
              (a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime(),
            );
          }
          setShiftRequests(data);
        }
      }

      {
        const { data, response } = await confirmedShiftRes;
        if (response.status === StatusCodes.UNAUTHORIZED) {
          navigate(appURL.login);
        }
        if (data) {
          const flatData = data.flatMap((userConfirmShifts) => {
            return userConfirmShifts.shiftTime.map((c) => {
              return {
                id: userConfirmShifts.userID,
                start: c[0],
                end: c[1],
              };
            });
          });

          flatData.sort(
            (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
          );

          setConfirmedShift(flatData);
        }
      }
    })();
  }, [selectedYearAndMonth]);

  return (
    <div className="h-screen w-5/6 flex flex-col p-5">
      <div className="w-full h-1/12 flex justify-center">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            views={["month", "year"]}
            timezone="Asia/Tokyo"
            value={selectedYearAndMonth}
            onChange={(val: Dayjs | null) => {
              if (val) {
                const selectYear = val.year().toString();
                const selectMonth = (val.month() + 1)
                  .toString()
                  .padStart(2, "0");
                setSelectedYearAndMonth(
                  dayjs(`${selectYear}-${selectMonth}-15`),
                );
              }
            }}
          />
        </LocalizationProvider>
      </div>
      <div className="flex">
        <Confirmed
          users={users}
          confirms={confirmedShift}
          setConfirmedShift={setConfirmedShift}
          focusDay={selectedYearAndMonth}
          confirmedShift={confirmedShift}
        />
        <Request users={users} shiftRequests={shiftRequests} />
      </div>
    </div>
  );
};

const Confirmed = ({
  users,
  confirms,
  setConfirmedShift,
  focusDay,
  confirmedShift,
}: ConfirmedProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userID, setUserID] = useState<number>();
  const [startTime, setStartTime] = useState<Dayjs>();
  const [endTime, setEndTime] = useState<Dayjs>();
  const [day, setDay] = useState<Dayjs>();

  return (
    <div className="w-2/3 flex flex-col items-center gap-2 p-5">
      <h2 className="text-2xl text-center font-bold">Confirmed</h2>
      <div className="w-4/5 h-1/12 justify-between flex">
        <button
          type="button"
          className="bg-cyan-400 w-2/5 text-white rounded-md hover:opacity-30 p-1"
          onClick={async () => {
            const userIDs = new Set(confirmedShift.map((s) => s.id));
            const response: {
              userID: number;
              shiftTime: [string, string][];
            }[] = [];

            for (const userID of userIDs) {
              const shiftTime: [string, string][] = confirmedShift
                .filter((s) => s.id === userID)
                .map((s) => [s.start, s.end]);
              response.push({ userID, shiftTime });
            }

            await client.PATCH("/api/employer/confirmedShift", {
              body: response,
            });
          }}
        >
          UPLOAD
        </button>
        <button
          type="button"
          className="bg-cyan-400 w-2/5 text-white rounded-md hover:opacity-30 p-1"
          onClick={() => setIsModalOpen(true)}
        >
          ADD
        </button>
        {isModalOpen && (
          <div className="fixed z-10 inset-0 overflow-y-auto h-screen">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="inline-block p-1 align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:w-2/3 sm:max-w-2xl">
                <div className="bg-white px-4">
                  <Select
                    className="w-full pb-1"
                    instanceId="search-select-box-modal"
                    options={users}
                    onChange={(user) => {
                      if (user) {
                        setUserID(user.id);
                      }
                    }}
                    noOptionsMessage={() => "user not found"}
                    placeholder={users.find((u) => u.id === userID)?.label}
                    isSearchable={true}
                  />
                </div>
                <div className="px-4">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <TimePicker
                      label="start"
                      timezone="Asia/Tokyo"
                      value={startTime}
                      onChange={(val) => {
                        if (val) {
                          setStartTime(val);
                        }
                      }}
                      ampm={false}
                    />
                    <TimePicker
                      label="end"
                      timezone="Asia/Tokyo"
                      value={endTime}
                      onChange={(val) => {
                        if (val) {
                          setEndTime(val);
                        }
                      }}
                      ampm={false}
                    />
                    <DatePicker
                      label={'"day"'}
                      views={["day"]}
                      value={day}
                      defaultValue={focusDay}
                      onChange={(val) => {
                        if (val) {
                          setDay(val);
                        }
                      }}
                    />
                  </LocalizationProvider>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="mr-2 p-2 bg-gray-300 rounded-md hover:opacity-30"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={
                      startTime == null ||
                      endTime == null ||
                      userID == null ||
                      day == null
                    }
                    onClick={() => {
                      const dayIso = dayjs
                        .utc(day?.toISOString())
                        .local()
                        .format();

                      const startIso = dayjs
                        .utc(startTime?.toISOString())
                        .local()
                        .format();
                      const endIso = dayjs
                        .utc(endTime?.toISOString())
                        .local()
                        .format();

                      setConfirmedShift((c) =>
                        [
                          ...c,
                          {
                            id: Number(userID),
                            start: dayIso.slice(0, -14) + startIso.slice(11),
                            end: dayIso.slice(0, -14) + endIso.slice(11),
                          },
                        ].sort(
                          (a, b) =>
                            new Date(a.start).getTime() -
                            new Date(b.start).getTime(),
                        ),
                      );
                    }}
                    className={`p-2 text-white rounded-md ${
                      startTime == null ||
                      endTime == null ||
                      userID == null ||
                      day == null
                        ? "bg-gray-300"
                        : "bg-cyan-400 hover:opacity-30"
                    }`}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="overflow-y-auto h-5/6 w-full flex flex-col gap-y-1">
        {confirms.map((c) => {
          const start = new Date(c.start);
          const end = new Date(c.end);
          return (
            <div key={c.start + c.id} className="flex justify-between w-full">
              <button
                className="p-1 rounded-md bg-red-600 hover:opacity-30"
                type="button"
                onClick={() =>
                  setConfirmedShift((co) => [
                    ...co.filter(
                      (con) => !(con.id === c.id && con.start === c.start),
                    ),
                  ])
                }
              >
                <IconContext.Provider value={{ color: "white" }}>
                  <BsTrash3 />
                </IconContext.Provider>
              </button>
              <p className="text-center w-1/12 text-lg font-bold">
                {start.toLocaleDateString().slice(-2).replace("/", "")}
              </p>
              <p className="rounded-md p-0.5 w-1/6 text-center bg-gray-100">
                {start.toLocaleTimeString().slice(0, -3)}
              </p>
              <p className="rounded-md p-0.5 w-1/6 text-center bg-gray-100">
                {end.toLocaleTimeString().slice(0, -3)}
              </p>
              <p>{users.find((u) => u.id === c.id)?.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Request = ({ users, shiftRequests }: RequestProps) => {
  const [userID, setUserID] = useState<number>();

  return (
    <div className="w-1/3 h-11/12 flex flex-col items-center gap-2 p-5">
      <h2 className="text-2xl h-1/12 text-center font-bold">Request</h2>
      <Select
        className="w-full"
        instanceId="search-select-box"
        options={users}
        onChange={(user) => {
          if (user) {
            setUserID(user.id);
          }
        }}
        noOptionsMessage={() => "user not found"}
        placeholder={users.find((u) => u.id === userID)?.label}
        isSearchable={true}
      />
      {shiftRequests ? (
        shiftRequests
          .filter(
            (shiftRequest) => userID == null || shiftRequest.userID === userID,
          )
          .map((shift) => {
            return (
              <>
                <p>{users.find((u) => u.id === shift.userID)?.label}</p>
                <div className="flex flex-col w-full h-5/6 gap-y-1 overflow-y-auto">
                  {shift.shiftTime.map((times) => {
                    const start = new Date(times[0]);
                    const end = new Date(times[1]);
                    return (
                      <div
                        className="w-full flex justify-between"
                        key={`${times[0]}`}
                      >
                        <p className="text-center w-1/6 text-lg font-bold">
                          {start
                            .toLocaleDateString()
                            .slice(-2)
                            .replace("/", "")}
                        </p>
                        <p className="rounded-md p-0.5 w-1/3 text-center bg-gray-100">
                          {start.toLocaleTimeString().slice(0, -3)}
                        </p>
                        <p className="rounded-md p-0.5 w-1/3 text-center bg-gray-100">
                          {end.toLocaleTimeString().slice(0, -3)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </>
            );
          })
      ) : (
        <LoadingSpinner />
      )}
    </div>
  );
};
