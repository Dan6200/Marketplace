// Generates A sql insert command.
export function InsertInTable(
	table: string,
	fields: string[],
	retValue: string // Change to array
): string {
	let insertQuery = `insert into ${table} (\n`
	const last = fields.length - 1
	insertQuery += fields.join(',\n')
	insertQuery += `\n) values (`
	for (let i = 0; i < last; i++) {
		insertQuery += `$${i + 1}, `
	}
	insertQuery += `$${last + 1}) returning ${retValue}`
	return insertQuery
}

// Generates A sql update command.
export function UpdateInTable(
	table: string,
	idName: string,
	fields: string[],
	condition: string
): string {
	let setFieldsToNewValues = 'set '
	const last = fields.length - 1
	// db query parameter list starts from 1, in case of a compound condition in the where clause.
	// The ith condition corresponds to the number of fields(N) + i. i.e cond1=${N+1} OR cond2=${N+2}
	for (let i = 0; i < last; i++) {
		setFieldsToNewValues += `${fields[i]} = $${i + 1},\n`
	}
	setFieldsToNewValues += `${fields[last]} = $${last + 1}`
	let output = `update ${table}\n${setFieldsToNewValues}\nwhere ${condition} returning ${idName}`
	return output
}

export function DeleteInTable(
	table: string,
	idName: string,
	condition: string
): string {
	return `delete from ${table} where ${condition} returning ${idName}`
}

export function SelectFromTable(
	table: string,
	fields: string[],
	condition: string
): string {
	return `select ${fields.join(',\n')} from ${table}${
		condition ? ` where ${condition}` : ``
	}`
}
