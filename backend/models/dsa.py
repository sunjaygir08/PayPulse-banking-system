class TransactionStack:
    """
    Stack implementation (LIFO) to store completed transaction records.
    The admin can pop the top transaction from this stack to perform an Undo.
    """
    def __init__(self):
        self.items = []

    def push(self, transaction):
        self.items.append(transaction)

    def pop(self):
        if not self.is_empty():
            return self.items.pop()
        return None

    def peek(self):
        if not self.is_empty():
            return self.items[-1]
        return None

    def is_empty(self):
        return len(self.items) == 0

    def size(self):
        return len(self.items)

    def clear(self):
        self.items = []


class PendingTransactionQueue:
    """
    Queue implementation (FIFO) to store transaction requests awaiting approval.
    """
    def __init__(self):
        self.items = []

    def enqueue(self, transaction_request):
        self.items.append(transaction_request)

    def dequeue(self):
        if not self.is_empty():
            return self.items.pop(0)
        return None

    def peek(self):
        if not self.is_empty():
            return self.items[0]
        return None

    def is_empty(self):
        return len(self.items) == 0

    def size(self):
        return len(self.items)

    def remove_by_id(self, req_id):
        # Helper to drop a rejected item from the queue
        for i, item in enumerate(self.items):
            if item.get("id") == req_id:
                return self.items.pop(i)
        return None


class AccountDictionary:
    """
    Dictionary implementation for fast O(1) in-memory account lookups.
    Key: account_number
    Value: dict containing account details (balances, status, customer_id)
    """
    def __init__(self):
        self.accounts_map = {}

    def put(self, account_number, account_data):
        self.accounts_map[account_number] = account_data

    def get(self, account_number):
        return self.accounts_map.get(account_number)

    def remove(self, account_number):
        if account_number in self.accounts_map:
            del self.accounts_map[account_number]

    def update_balance(self, account_number, current_balance, available_balance):
        if account_number in self.accounts_map:
            self.accounts_map[account_number]["balance"] = current_balance
            self.accounts_map[account_number]["available_balance"] = available_balance

    def update_status(self, account_number, status):
        if account_number in self.accounts_map:
            self.accounts_map[account_number]["status"] = status

    def clear(self):
        self.accounts_map = {}


def quicksort_transactions(transactions_list, key="created_at", reverse=True):
    """
    Custom QuickSort algorithm to sort transaction logs (Python Lists) in memory.
    """
    if len(transactions_list) <= 1:
        return transactions_list
    
    pivot = transactions_list[len(transactions_list) // 2]
    pivot_val = pivot.get(key)
    
    # Handle potentially missing keys safely
    left = []
    middle = []
    right = []
    
    for x in transactions_list:
        val = x.get(key)
        if val < pivot_val:
            left.append(x)
        elif val == pivot_val:
            middle.append(x)
        else:
            right.append(x)
            
    if reverse:
        return quicksort_transactions(right, key, reverse) + middle + quicksort_transactions(left, key, reverse)
    else:
        return quicksort_transactions(left, key, reverse) + middle + quicksort_transactions(right, key, reverse)
