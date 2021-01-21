import { apiRequest } from "./util";

function subscribe(data: any) {
  return apiRequest("newsletter", "POST", data);
}

export default { subscribe };
