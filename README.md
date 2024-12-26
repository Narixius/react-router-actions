# React Router Actions

## Overview
`react-router-actions` is a package that allows you to manage multiple actions on a single React Router route. This can be particularly useful for handling complex routing scenarios where different actions need to be performed based on a single route.

To install the package, run:
```bash
npm i react-router-actions
```

### Features
- [x] 0 Dependency
- [x] Works with Javascript disabled
- [ ] Supports callbacks (`onSuccess`, `onError`)

## Usage
Import the `actions` from the `react-router-actions` package and define the action of the route using this utility method. The `actions` method takes an object as an argument, where each key represents an action name and the value is a action function that performs the action.

```tsx
import { actions, useAction } from 'react-router-actions';
import { useLoaderData } from 'react-router'

export const action = actions({
	updateUser: (ctx) => {
		// update user ...
		return { message: "User updated successfully" }
	},
	deleteUser: (ctx) => {
		// delete user ...
		return { message: "User deleted successfully" }
	}
})

export const loader = () => {
	return { userInfo: {...} }
}

function EditUserRoute() {
	const { userInfo } = useLoaderData()
	const updateUserAction = useAction('updateUser')
	const deleteUserAction = useAction('deleteUser')
  return (
	<div>
    <updateUserAction.Form>
		<input name='first_name' defaultValue={userInfo.first_name} />
		<input name='last_name' defaultValue={userInfo.last_name} />
		<button type='submit'>Save</button>
	</updateUserAction.Form>
	<deleteUserAction.Form>
		<button type='submit'>Delete User</button>
	</deleteUserAction.Form>
	</div>
  );
}

export default EditUserRoute;
```

The `useAction` method is some sort of a wrapper around the `useFetcher` hook from the `react-router`. You need to pass the action name as an argument to the `useAction` method to get the action object. It will send the action name as a query param (`_action`) to the server and the specified action will be invoked. The `_action` query param will used to determine which action has been invoked when the Javascript is disabled.

### License
This project is licensed under the MIT License.
