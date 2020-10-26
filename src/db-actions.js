export const getRules = async () => {
	try {
		const res = await fetch('http://localhost:8080/rules');
		const result = await res.json();
		return result;
	} catch (error) {
		alert(`There was an error fetching rules \n Error: ${error}`);
		return [];
	}
};

export const addRule = async (rule) => {
	const { text, replace} = rule
	try {
		const res = await fetch('http://localhost:8080/rules', {
			body: JSON.stringify({
				text,
				replace,
				checked: true
			}),
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			method: 'POST'
		});
		const result = await res.json();
		console.log('THIS IS ADD RESULT', result);
		return result;
	} catch (error) {
		console.log('THERE WAS AN ERROR', error);
		alert(`There was an error ADDING a rule \n Error: ${error}`);
		return null;
	}
};

export const updateRule = async (rule) => {
	const { id, text, replace, checked} = rule
	try {
		const res = await fetch(`http://localhost:8080/rules/${id}`, {
			body: JSON.stringify({
				text,
				replace,
				checked
			}),
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			method: 'PUT'
		});
		const result = await res.json();
		alert(`Rule updated succesfully `);
		return result;
	} catch (error) {
		alert(`There was an error UPDATEING a rule \n Error: ${error}`);
		return null;
	}
};

export const deleteRule = async (id) => {
	try {
		const res = await fetch(`http://localhost:8080/rules/${id}`, {
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			method: 'DELETE'
		});
		const result = await res.json();
		alert(`Rule deleted succesfully `);
		return result;
	} catch (error) {
		alert(`There was an error DELETEING a rule \n Error: ${error}`);
		return null;
	}
};
