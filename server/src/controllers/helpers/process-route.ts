import { Response } from 'express';
import { RequestWithPayload } from 'types-and-interfaces/request';
import { StatusCodes } from 'http-status-codes';
import path from 'path';
// const filename = path.join(path.basename(__dirname), path.basename(__filename));

// TODO: scrutinize this function
const { CREATED, OK, NO_CONTENT, NOT_FOUND } = StatusCodes;

type Status = typeof CREATED | typeof OK | typeof NO_CONTENT | typeof NOT_FOUND;

type ResponseData = {
	status: Status;
	data?: string | object;
};
export default (
	dbQueries: ((sqlData: object) => any)[],
	responseData: ResponseData,
	validateBody?: (data: object) => any,
	validateResult?: (data: object, status: Status) => ResponseData,
	processData?: (data: object) => any
) => {
	// return the route processor middleware
	return async (request: RequestWithPayload, response: Response) => {
		// variables
		let result: any,
			reqData: any,
			{ userId } = request.user;
		// set status code and response data
		// Validate request data
		if (request.body && validateBody) {
			// validateBody returns error status code and message if body is invalid
			const { status, reqData } = validateBody(request.body);
			// check for errors
			if (status >= 400) return response.status(status).send(reqData);
		}
		// Process the requestData
		if (processData && reqData) reqData = processData(reqData as object);
		let { status, data } = responseData;
		for (let query of dbQueries) {
			result = await query({
				userId,
				params: request.params,
				reqData,
			});
			debugger;
			if (result && validateResult) {
				// validateBody returns error status code and message if data is invalid
				({ status, data } = validateResult(
					result,
					responseData.status
				));
				// check for errors
				if (status >= 400) return response.status(status).send(data);
			}
		}
		// Update the data with the same status code
		response.status(status).send(data);
	};
};
