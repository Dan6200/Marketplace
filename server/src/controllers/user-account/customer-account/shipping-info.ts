import { Response } from "express";
import joi from "joi";
import { StatusCodes } from "http-status-codes";
import assert from "node:assert/strict";
import { QueryResult } from "pg";
import {
  ShippingInfoSchemaReq,
  ShippingInfoSchemaDB,
} from "../../../app-schema/customer/shipping.js";
import db from "../../../db/index.js";
import { BadRequestError } from "../../../errors/index.js";
import {
  RequestWithPayload,
  RequestUserPayload,
} from "../../../types-and-interfaces/request.js";
import { Insert, Update } from "../../helpers/generate-sql-commands/index.js";

const selectShippingInfo = `
select 
	address_id,
	recipient_first_name,
	recipient_last_name,
	street,
	city,
	state,
	postal_code,
	delivery_contact,
	delivery_instructions
from shipping_info`;

const createShippingInfo = async (
  request: RequestWithPayload,
  response: Response
) => {
  const { userId: customerId }: RequestUserPayload = request.user;
  const validData = ShippingInfoSchemaReq.validate(request.body);
  if (validData.error)
    throw new BadRequestError(
      "Invalid Data Schema: " + validData.error.message
    );
  const shippingData = validData.value;
  let dbQuery: QueryResult = await db.query(
    `${Insert("shipping_info", [
      "customer_id",
      ...Object.keys(shippingData),
    ])} returning address_id`,
    [customerId, ...Object.values(shippingData)]
  );
  let { rowCount }: { rowCount: number } = dbQuery;
  let lastInsert = rowCount ? rowCount - 1 : rowCount;
  assert.ok(lastInsert >= 0 && lastInsert < rowCount);
  let shippingAddress = dbQuery.rows[lastInsert];
  response.status(StatusCodes.CREATED).send(shippingAddress);
};

const getAllShippingInfo = async (
  request: RequestWithPayload,
  response: Response
) => {
  const { userId: customerId } = request.user;
  const shippingInfos: any[] = (
    await db.query(selectShippingInfo + " where customer_id=$1", [customerId])
  ).rows;
  assert.ok(Array.isArray(shippingInfos));
  if (shippingInfos.length === 0)
    return response
      .status(StatusCodes.NOT_FOUND)
      .send("customer has no shipping information available");
  joi.assert(shippingInfos[0], ShippingInfoSchemaDB);
  response.status(StatusCodes.OK).send(shippingInfos);
};

const getShippingInfo = async (
  request: RequestWithPayload,
  response: Response
) => {
  const { addressId } = request.params;
  if (!addressId) throw new BadRequestError("Id parameter not available");
  const shippingInfo = (
    await db.query(selectShippingInfo + " where address_id=$1", [addressId])
  ).rows[0];
  if (!shippingInfo)
    return response
      .status(StatusCodes.NOT_FOUND)
      .send("Shipping Information cannot be found");
  joi.assert(shippingInfo, ShippingInfoSchemaDB);
  response.status(StatusCodes.OK).send(shippingInfo);
};

const updateShippingInfo = async (
  request: RequestWithPayload,
  response: Response
) => {
  const { addressId } = request.params,
    shippingData = request.body;
  let fields = Object.keys(shippingData),
    data = Object.values(shippingData);
  await db.query(`${Update("shipping_info", "address_id", fields)}`, [
    addressId,
    ...data,
  ]);
  const shippingInfo = (
    await db.query(selectShippingInfo + " where address_id=$1", [addressId])
  ).rows[0];
  joi.assert(shippingInfo, ShippingInfoSchemaDB);
  if (!shippingInfo)
    return response
      .status(StatusCodes.NOT_FOUND)
      .send("Shipping Information cannot be found");
  response.status(StatusCodes.OK).send(shippingInfo);
};

const deleteShippingInfo = async (
  request: RequestWithPayload,
  response: Response
) => {
  const { addressId } = request.params;
  await db.query(
    `delete from shipping_info
			where address_id=$1`,
    [addressId]
  );
  response.status(StatusCodes.NO_CONTENT).send();
};

export {
  createShippingInfo,
  getShippingInfo,
  getAllShippingInfo,
  updateShippingInfo,
  deleteShippingInfo,
};
