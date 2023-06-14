import db from "../../../../db/index.js";
import { registration } from "../../../helpers/auth/index.js";
import {
  newUsers,
  storesData,
  updatedStoresData,
} from "../../../helpers/load-yaml.js";
import {
  testCreateVendor,
  testDeleteVendor,
  testGetNonExistentVendor,
  testGetVendor,
} from "../../../helpers/user/vendor/index.js";
import {
  testCreateStore,
  testGetStore,
  testUpdateStore,
  testDeleteStore,
  testGetNonExistentStore,
} from "../../../helpers/user/vendor/store/index.js";

export default function (agent: ChaiHttp.Agent, index: number) {
  after(async () => db.query("delete from user_accounts"));

  const path = "/v1/user/vendor";
  const storesPath = path + "/stores";

  it("it should register a new user", () =>
    registration(agent, newUsers[index]));

  it("it should create a vendor account for the user", () =>
    testCreateVendor(agent, path));

  it("it should get the user's vendor account", () =>
    testGetVendor(agent, path));

  it("should create a store for the vendor", () =>
    testCreateStore(agent, storesPath, storesData[index]));

  it("should fetch the newly created store", () =>
    testCreateStore(agent, storesPath, storesData[index]).then(({ store_id }) =>
      testGetStore(agent, storesPath + "/" + store_id)
    ));

  it("should update the store", () =>
    testCreateStore(agent, storesPath, storesData[index]).then(({ store_id }) =>
      testUpdateStore(
        agent,
        storesPath + "/" + store_id,
        updatedStoresData[index]
      )
    ));

  it("should delete the created store and fail to retrieve it", () =>
    testCreateStore(agent, storesPath, storesData[index]).then(({ store_id }) =>
      testDeleteStore(agent, storesPath + "/" + store_id).then(() =>
        testGetNonExistentStore(agent, storesPath + "/" + store_id)
      )
    ));

  it("it should delete the user's vendor account", () =>
    testDeleteVendor(agent, path));

  it("it should fail to get the user's vendor account", () =>
    testGetNonExistentVendor(agent, path));
}
