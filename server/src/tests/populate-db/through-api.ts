//cspell:ignore Aliyu
import FormData from 'form-data'
import dotenv from 'dotenv'
import fs from 'fs/promises'
import axios from 'axios'
import { Product } from '../../types-and-interfaces/products.js'
import db from '../../db/pg/index.js'
import { AccountData } from '../../types-and-interfaces/account.js'
import { ProductMedia } from '../../types-and-interfaces/products.js'
import StoresData from '../../types-and-interfaces/stores-data.js'
import * as Aliyu from '../integrated-tests/data/users/vendors/user-aliyu/index.js'

dotenv.config()
const vendors = [Aliyu]

await db.query({ text: 'DELETE FROM user_accounts' })

for (let vendor of vendors) {
	await createProducts(vendor)
}

async function createProducts({
	accountInfo,
	stores,
	products,
	productMedia,
}: {
	accountInfo: AccountData
	stores: StoresData[]
	products: Product[]
	productMedia: ProductMedia[][]
}) {
	// Register a new user
	const server = process.env.LOCAL_APP_SERVER!
	const { token } = await register(server, accountInfo)
	// Create a vendor account for the user
	await createResource(server + '/v1/account/vendor', token, null, null)

	let idx: number, store: StoresData
	for ([idx, store] of stores.entries()) {
		const { store_id } = await createResource(
			server + '/v1/stores',
			token,
			null,
			store
		)

		for (const [idx, product] of products.entries()) {
			const { product_id } = await createResource(
				server + '/v1/products',
				token,
				{ store_id },
				product
			)
			await uploadMedia(
				server + '/v1/media',
				token,
				{
					product_id,
				},
				productMedia[idx]
			)
		}
	}
}

async function register(server: string, accountInfo: AccountData) {
	try {
		const response = await axios.post(`${server}/v1/auth/register`, accountInfo)
		return response.data
	} catch (error) {
		throw error
	}
}

async function createResource(
	url: string,
	token: string,
	query: object | null,
	data: object | null
): Promise<any> {
	const headers = { Authorization: `Bearer ${token}` }
	try {
		const response = await axios.post(url, data, { headers, params: query })
		return response.data
	} catch (error) {
		throw error
	}
}

async function uploadMedia(
	url: string,
	token: string,
	query: object | null,
	files: {
		name: string
		path: string
		description: string
		is_display_image: boolean
	}[]
): Promise<any> {
	const form = new FormData()
	const fieldName = 'product-media'
	await Promise.all(
		files.map(async file => {
			form.append(fieldName, await fs.readFile(file.path), {
				filename: file.name,
			} as any)
		})
	)
	const descriptions = files.reduce((acc, file) => {
		acc[file.name] = file.description
		return acc
	}, {})

	const isDisplayImage = files.reduce((acc, file) => {
		acc[file.name] = file.is_display_image
		return acc
	}, {})

	form.append('is_display_image', JSON.stringify(isDisplayImage))
	form.append('descriptions', JSON.stringify(descriptions))

	const headers = { ...form.getHeaders(), Authorization: `Bearer ${token}` }
	try {
		const response = await axios.post(url, form, { headers, params: query })
		return response.data
	} catch (error) {
		console.error(error)
	}
}
