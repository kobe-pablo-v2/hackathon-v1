import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import { appURL } from "./config/url";
import { DetailAttendance } from "./feature/attendance/detailPage";
import { Attendance } from "./feature/attendance/page";
import { Login } from "./feature/auth/page";
import { Shift } from "./feature/shift/page";
import { User } from "./feature/user/page";
import { DefaultLayout } from "./ui/layout";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route index element={<Login />} />
      <Route element={<DefaultLayout />}>
        <Route path={appURL.user} element={<User />} />
        <Route path={appURL.shift} element={<Shift />} />
        <Route path={appURL.attendance} element={<Attendance />}>
          <Route
            path={appURL.detailAttendance}
            element={<DetailAttendance />}
          />
        </Route>
      </Route>
    </>,
  ),
  { basename: "/hackathon-v1/" },
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
