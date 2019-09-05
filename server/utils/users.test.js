const expect = require('expect');
const { Users } = require('./users');

describe('Users', () => {

    beforeEach(() => {
        users = new Users();
        users.users = [{
                id: '1',
                name: 'Moore',
                room: 'ABC'
            },
            {
                id: '2',
                name: 'Dreamer',
                room: 'XYZ'
            },
            {
                id: '3',
                name: 'Sleep',
                room: 'ABC'
            }
        ]
    });

    it('should add new user', () => {
        let users = new Users();
        let user = {
            id: '123',
            name: 'Moore',
            room: 'ABC'
        }

        let resUsers = users.addUser(user.id, user.name, user.room);

        expect(users.users).toEqual([user]);
    });

    it('should remove a user', () => {
        let user = users.removeUser('1');
        expect(user.name).toBe('Moore');
        expect(users.users.length).toBe(2);
    });

    it('should not remove a user', () => {
        let user = users.removeUser('15');
        expect(user).toBeFalsy();
        expect(users.users.length).toBe(3);
    });

    it('should get a user', () => {
        let user = users.getUser('1');
        expect(user.name).toBe('Moore');
    });

    it('should not get a user', () => {
        let user = users.getUser('34');
        expect(user).toBeFalsy();
    });

    it('should return names for ABC', () => {
        let userList = users.getUserList('ABC');
        expect(userList).toEqual(['Moore', 'Sleep']);
    })
})