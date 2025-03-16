import { mock } from "node:test";
import * as notifs from "../../index";
import {Types} from "mongoose";


describe ("validate endpoint connections", () =>{

    beforeEach(() => {

        jest.restoreAllMocks();

        const mockChores = [
            { title: 'Wash Dishes', assignedTo: 'Shmeelix', deadline: new Date('2025-02-22T18:00:00Z'), isComplete: false },
            { title: 'Clean kitchen', assignedTo: 'Max', deadline: new Date('2025-02-22T18:00:00Z'), isComplete: true },
            { title: 'Clean toilet', assignedTo: 'Finn', deadline: new Date('2025-02-22T18:00:00Z'), isComplete: true }
        ] as any;

        const mockBills = [
            { title: 'Rent', assignedTo: 'Bob', amount: '1500' , deadline: new Date('2025-02-22T18:00:00Z'), isComplete: false},
            { title: 'Gas', assignedTo: 'Bob', amount: '50' , deadline: new Date('2025-02-22T18:00:00Z'), isComplete: true},
            { title: 'Water', assignedTo: 'Bob', amount: '30' , deadline: new Date('2025-02-22T18:00:00Z'), isComplete: true}
        ] as any;

        const none = [] as any;

        let chores_none = false;
        let bills_none = false;

        jest.spyOn(notifs, "fetchChores").mockImplementation(
            () => { 
                if (chores_none) {
                    return none;
                } else {
                    return mockChores;
                }
            }
        );

        jest.spyOn(notifs, "fetchBills").mockImplementation(
            () => { 
                if (bills_none) {
                    return none;
                } else {
                    return mockBills;
                }
            }
        );

        jest.spyOn(notifs, "fetchChores").mockResolvedValue(mockChores);
        jest.spyOn(notifs, "fetchBills").mockResolvedValue(mockBills);

    });


    test("Appropriate returns when chores and bills are correctly fetched", async () => {
        await notifs.fetchChores();
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining("Upcoming Chores:"));
    });

    test("Error caught when chores are null", async () => {
        let chores_none = true;
        await notifs.fetchChores();
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining("Error fetching"));
    });

    test("Error caught when bills are null", async () => {
        let bills = true;
        await notifs.fetchChores();
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining("Error fetching"));
    });
    
});


